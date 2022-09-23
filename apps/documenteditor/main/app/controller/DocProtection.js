/*
 *
 * (c) Copyright Ascensio System SIA 2010-2022
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
 *  DocProtection.js
 *
 *  Created by Julia Radzhabova on 21.09.2022
 *  Copyright (c) 2022 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'core',
    'common/main/lib/view/Protection',
    'documenteditor/main/app/view/DocProtection',
    'documenteditor/main/app/view/ProtectDialog'
], function () {
    'use strict';

    Asc.c_oAscProtection = {
        View: 1,
        Forms: 2,
        Review: 3,
        Comments: 4
    };

    if (!Common.enumLock)
        Common.enumLock = {};

    var enumLock = {
        docLockView: 'lock-mode-view',
        docLockForms: 'lock-mode-forms',
        docLockReview: 'lock-mode-review',
        docLockComments: 'lock-mode-comments'
    };
    for (var key in enumLock) {
        if (enumLock.hasOwnProperty(key)) {
            Common.enumLock[key] = enumLock[key];
        }
    }

    DE.Controllers.DocProtection = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'DocProtection'
        ],

        initialize: function () {

            this.addListeners({
                'DocProtection': {
                    'protect:document':      _.bind(this.onProtectDocClick, this)
                }
            });
        },
        onLaunch: function () {
            this._state = {};
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
        },
        setConfig: function (data, api) {
            this.setApi(api);
        },
        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onChangeProtectDocument',_.bind(this.onChangeProtectDocument, this));
            }
        },

        setMode: function(mode) {
            this.appConfig = mode;

            this.appConfig.isEdit && (this.view = this.createView('DocProtection', {
                mode: mode
            }));

            return this;
        },

        createToolbarPanel: function() {
            if (this.view)
                return this.view.getPanel();
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onProtectDocClick: function(state) {
            this.view.btnProtectDoc.toggle(!state, true);
            if (state) {
                var me = this,
                    btn,
                    win = new DE.Views.ProtectDialog({
                        handler: function(result, value, props) {
                            btn = result;
                            if (result == 'ok') {
                                // var props = me.api.asc_getProtectedDocument();
                                // props.asc_setType(props);
                                // props.asc_setLockPwd(value);
                                // me.api.asc_setProtectedDocument(props);

                                me.view.btnProtectDoc.toggle(true, true); // test
                                me.onChangeProtectDocument(); // test
                            }
                            Common.NotificationCenter.trigger('edit:complete');
                        }
                    }).on('close', function() {
                        if (btn!=='ok')
                            me.view.btnProtectDoc.toggle(false, true);
                    });

                win.show();
            } else {
                var me = this,
                    btn,
                    // props = me.api.asc_getProtectedDocument();
                    props = undefined; // test
                // if (props.asc_isPassword()) {
                if (props && props.asc_isPassword()) {
                    var win = new Common.Views.OpenDialog({
                        title: me.view.txtWBUnlockTitle,
                        closable: true,
                        type: Common.Utils.importTextType.DRM,
                        txtOpenFile: me.view.txtWBUnlockDescription,
                        validatePwd: false,
                        handler: function (result, value) {
                            btn = result;
                            if (result == 'ok') {
                                if (me.api) {
                                    // props.asc_setLockPwd(value && value.drmOptions ? value.drmOptions.asc_getPassword() : undefined);
                                    // me.api.asc_setProtectedDocument(props);
                                }
                                Common.NotificationCenter.trigger('edit:complete');
                            }
                        }
                    }).on('close', function() {
                        if (btn!=='ok')
                            me.view.btnProtectDoc.toggle(true, true);
                    });

                    win.show();
                } else {
                    me.view.btnProtectDoc.toggle(false, true); // test
                    me.onChangeProtectDocument(); // test
                    // props.asc_setLockPwd();
                    // me.api.asc_setProtectedDocument(props);
                }
            }
        },

        onAppReady: function (config) {
            if (!this.view) return;

            var me = this;
            (new Promise(function (resolve) {
                resolve();
            })).then(function () {
                // me.view.btnProtectDoc.toggle(me.api.asc_isProtectedDocument(), true);
            });
        },

        onChangeProtectDocument: function() {
            // var isProtected = this.api.asc_isProtectedDocument();
            var isProtected = this.view.btnProtectDoc.isActive(); // test
            this.view && this.view.btnProtectDoc.toggle(isProtected, true);
            var props = this.getDocProps(true);
            Common.NotificationCenter.trigger('protect:doclock', props);
        },

        getDocProps: function(update) {
            if (!this.appConfig || !this.appConfig.isEdit && !this.appConfig.isRestrictedEdit) return;

            if (update || !this._state.docProtection) {
                // var docProtected = !!this.api.asc_isProtectedDocument(),
                //     type;
                //
                // if (docProtected) {
                //     var props = this.api.asc_getProtectedDocument();
                //     type = props.asc_getType();
                // }

                // test //////
                var docProtected = this.view.btnProtectDoc.isActive(),
                    type;

                if (docProtected) {
                    type = Asc.c_oAscProtection.View;
                }
                /////////////
                this._state.docProtection = {docLock: docProtected, lockMode: type};
            }

            return this._state.docProtection;
        }

    }, DE.Controllers.DocProtection || {}));
});