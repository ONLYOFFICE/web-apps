/*
 *
 * (c) Copyright Ascensio System SIA 2010-2021
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
 *  WBProtection.js
 *
 *  Created by Julia Radzhabova on 21.06.2021
 *  Copyright (c) 2021Ascensio System SIA. All rights reserved.
 *
 */
define([
    'core',
    'common/main/lib/view/Protection',
    'spreadsheeteditor/main/app/view/WBProtection'
], function () {
    'use strict';

    SSE.Controllers.WBProtection = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'WBProtection'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'WBProtection': {
                    'protect:workbook':      _.bind(this.onWorkbookClick, this),
                    'protect:sheet':     _.bind(this.onSheetClick, this),
                    'protect:ranges':     _.bind(this.onRangesClick, this),
                    'protect:lock-options':     _.bind(this.onLockOptionClick, this)
                }
            });
        },
        onLaunch: function () {
            this._state = {};

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
        },
        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
            }
        },
        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            }
        },

        setMode: function(mode) {
            this.appConfig = mode;

            this.view = this.createView('WBProtection', {
                mode: mode
            });

            return this;
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onWorkbookClick: function(state) {
            var me = this,
                win = new Common.Views.PasswordDialog({
                    api: me.api,
                    txtTitle: me.view.txtWBTitle,
                    txtDescription: me.view.txtWBDescription,
                    passwordOptional: true,
                    height: 291,
                    buttons: [{
                        value: 'ok',
                        caption: me.view.txtProtect
                    }, 'cancel'],
                    primary: 'ok',
                    handler: function(result, props) {
                        if (result == 'ok') {
                            me.api.asc_setProtectedWorkbook(me.api.asc_getProtectedWorkbook());
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();
        },

        onSheetClick: function(state) {
        },

        onRangesClick: function() {
        },

        onLockOptionClick: function(type, value) {
            switch (type) {
                case 0: // cell
                    // this._originalProps.asc_getStyleInfo().asc_setShowRowHeaders(this.api, this._originalProps, value=='checked');
                    break;
                case 1: // shape
                    break;
                case 2: // text
                    break;
                case 3: // formula
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (resolve) {
                resolve();
            })).then(function () {
                me.view.btnProtectWB.toggle(me.api.asc_isProtectedWorkbook(), true);
            });
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        }

    }, SSE.Controllers.WBProtection || {}));
});