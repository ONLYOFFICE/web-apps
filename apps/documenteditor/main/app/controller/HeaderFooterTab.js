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
 *  HeaderFooterTab.js
 *
 *  Created on 10.21.2025
 *
 */

define([
    'core',
    'documenteditor/main/app/view/HeaderFooterTab'
], function () {
    'use strict';

    DE.Controllers.HeaderFooterTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'HeaderFooterTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
            this.addListeners({
                'HeaderFooterTab': {
                    'header:editremove':      _.bind(this.editRemoveHeader, this),
                    'footer:editremove':      _.bind(this.editRemoveFooter, this),
                    'headerfooter:pagecount': _.bind(this.onInsertPageCountClick, this),
                    'headerfooter:pospick':   _.bind(this.onInsertPageNumberClick, this),
                    'headerfooter:inspagenumber':   _.bind(this.onInsertPageNumberMenuClick, this),
                },
            });
        },

        onInsertPageNumberClick: function(picker, item, record, e) {
            if (this.api)
                this.api.put_PageNum(record.get('data').type, record.get('data').subtype);

            if (e.type !== 'click')
                this.toolbar.btnEditHeader.menu.hide();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            // Common.component.Analytics.trackEvent('ToolBar', 'Page Number');
        },

        onInsertPageNumberMenuClick: function (item) {
            if (this.api) {
                if (item.value === 'current') {
                    this.api.put_PageNum(-1);
                } else if (item.value === 'format') {
                    var me = this;
                    me._docProtectDlg  = new DE.Views.PageNumberingDlg({
                        props: me.appConfig,
                        handler: function(result, value, props) {
                            if (result == 'ok') {
                                var protection = me.api.asc_getDocumentProtection() || new AscCommonWord.CDocProtect();
                                protection.asc_setEditType(props);
                                protection.asc_setPassword(value);
                                me.api.asc_setDocumentProtection(protection);
                            }
                            Common.NotificationCenter.trigger('edit:complete');
                        }
                    }).on('close', function() {
                        me._docProtectDlg = undefined;
                    });

                    me._docProtectDlg.show();
                }
            this.fireEvent('editcomplete', this);
            }
        },

        editRemoveHeader: function(item) {
            if (this.api) {
                if (item.value === 'edit') {
                    this.api.GoToHeader(this.api.getCurrentPage());
                } else if (item.value === 'remove') {
                    this.api.asc_RemoveHeader(this.api.getCurrentPage());
                }
            }
            // Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            // Common.component.Analytics.trackEvent('ToolBar', 'Edit ' + item.value);
        },

        editRemoveFooter: function(item) {
            if (this.api) {
                if (item.value === 'edit') {
                    this.api.GoToFooter(this.api.getCurrentPage());
                } else if (item.value === 'remove') {
                    this.api.asc_RemoveFooter(this.api.getCurrentPage());
                }
            }
            // Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            // Common.component.Analytics.trackEvent('ToolBar', 'Edit ' + item.value);
        },

        onInsertPageCountClick: function(item, e) {
            if (this.api)
                this.api.asc_AddPageCount();

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
            // Common.component.Analytics.trackEvent('ToolBar', 'Pages Count');
        },

        onLaunch: function () {
            this._state = {};
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
            }
            return this;
        },

        setConfig: function(config) {
            var mode = config.mode;
            this.toolbar = config.toolbar;
            this.view = this.createView('HeaderFooterTab', {
                toolbar: this.toolbar.toolbar,
                mode: mode,
                compactToolbar: this.toolbar.toolbar.isCompactView
            });
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onCoAuthoringDisconnect: function() {
            Common.Utils.lockControls(Common.enumLock.lostConnect, true, {array: this.view.lockedControls});
        },

        onAppReady: function (config) {
            var me = this;
            if (me.view) {
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.view.setEvents();

                    if (Common.Utils.InternalSettings.get('toolbar-active-tab')==='headerfooter')
                        Common.NotificationCenter.trigger('tab:set-active', 'headerfooter');
                });
            }
        },

        onDocumentReady: function() {
            Common.Utils.lockControls(Common.enumLock.disableOnStart, false, {array: this.view.lockedControls});
        },
    }, DE.Controllers.HeaderFooterTab || {}));
});
