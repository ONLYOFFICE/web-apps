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
 *  Protection.js
 *
 *  Created on 14.11.2017
 *
 */

if (Common === undefined)
    var Common = {};
Common.Controllers = Common.Controllers || {};

define([
    'core',
    'common/main/lib/view/Protection'
], function () {
    'use strict';

    Common.Controllers.Protection = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'Common.Views.Protection'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'Common.Views.Protection': {
                    'protect:password':      _.bind(this.onPasswordClick, this),
                    'protect:signature':     _.bind(this.onSignatureClick, this)
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

                if (this.appConfig.isPasswordSupport)
                    this.api.asc_registerCallback('asc_onDocumentPassword',  _.bind(this.onDocumentPassword, this));
                if (this.appConfig.isSignatureSupport) {
                    Common.NotificationCenter.on('protect:sign',            _.bind(this.onSignatureRequest, this));
                    Common.NotificationCenter.on('protect:signature',       _.bind(this.onSignatureClick, this));
                    this.api.asc_registerCallback('asc_onSignatureClick',   _.bind(this.onSignatureSign, this));
                    this.api.asc_registerCallback('asc_onUpdateSignatures', _.bind(this.onApiUpdateSignatures, this));
                }
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            }
        },

        setMode: function(mode) {
            this.appConfig = mode;

            this.view = this.createView('Common.Views.Protection', {
                mode: mode
            });

            return this;
        },

        onDocumentPassword: function(hasPassword, disabled) {
            this.view && this.view.onDocumentPassword(hasPassword, disabled);
        },

        SetDisabled: function(state, canProtect) {
            this.view && this.view.SetDisabled(state, canProtect);
        },

        onPasswordClick: function(btn, opts){
            switch (opts) {
                case 'add': this.addPassword(); break;
                case 'delete': this.deletePassword(); break;
            }

            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onSignatureRequest: function(guid){
            this.api.asc_RequestSign(guid);
        },

        onSignatureClick: function(type, signed, guid){
            switch (type) {
                case 'invisible': this.onSignatureRequest('unvisibleAdd'); break;
                case 'visible': this.addVisibleSignature(signed, guid); break;
            }
        },

        createToolbarPanel: function() {
            return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
                me.onChangeProtectDocument();
                Common.NotificationCenter.on('protect:doclock', _.bind(me.onChangeProtectDocument, me));
            });
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props && this.view) {
                this.view._state.docProtection = props;
            }
        },

        addPassword: function() {
            var me = this,
                win = new Common.Views.PasswordDialog({
                    api: me.api,
                    handler: function(result, props) {
                        if (result == 'ok') {
                            me.api.asc_setCurrentPassword(props);
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();
        },

        deletePassword: function() {
            this.api.asc_resetPassword();
        },

        addInvisibleSignature: function() {
            var me = this,
                win = new Common.Views.SignDialog({
                    api: me.api,
                    signType: 'invisible',
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            var props = dlg.getSettings();
                            me.api.asc_Sign(props.certificateId);
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();
        },

        addVisibleSignature: function(signed, guid) {
            var me = this,
                win = new Common.Views.SignSettingsDialog({
                    type: (!signed) ? 'edit' : 'view',
                    handler: function(dlg, result) {
                        if (!signed && result == 'ok') {
                            me.api.asc_AddSignatureLine2(dlg.getSettings());
                        }
                        Common.NotificationCenter.trigger('edit:complete');
                    }
                });

            win.show();

            if (guid)
                win.setSettings(this.api.asc_getSignatureSetup(guid));
        },

        signVisibleSignature: function(guid, width, height) {
            var me = this;
            if (_.isUndefined(me.fontStore)) {
                me.fontStore = new Common.Collections.Fonts();
                var fonts = me.getApplication().getController('Toolbar').getView('Toolbar').cmbFontName.store.toJSON();
                var arr = [];
                _.each(fonts, function(font, index){
                    if (!font.cloneid) {
                        arr.push(_.clone(font));
                    }
                });
                me.fontStore.add(arr);
            }

            var win = new Common.Views.SignDialog({
                api: me.api,
                signType: 'visible',
                fontStore: me.fontStore,
                signSize: {width: width || 0, height: height || 0},
                handler: function(dlg, result) {
                    if (result == 'ok') {
                        var props = dlg.getSettings();
                        me.api.asc_Sign(props.certificateId, guid, props.images[0], props.images[1]);
                    }
                    Common.NotificationCenter.trigger('edit:complete');
                }
            });

            win.show();
        },

        onSignatureSign: function(guid, width, height, isVisible) {
            (isVisible) ? this.signVisibleSignature(guid, width, height) : this.addInvisibleSignature();
        },

        onApiUpdateSignatures: function(valid, requested){
            this.SetDisabled(valid && valid.length>0, true);// can add invisible signature
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        }

    }, Common.Controllers.Protection || {}));
});