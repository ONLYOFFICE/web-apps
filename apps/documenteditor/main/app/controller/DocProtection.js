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

    if (!Common.enumLock)
        Common.enumLock = {};

    var enumLock = {
        docLockView: 'lock-mode-view',
        docLockForms: 'lock-mode-forms',
        docLockReview: 'lock-mode-review',
        docLockComments: 'lock-mode-comments',
        protectLock: 'protect-lock'
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
                this.api.asc_registerCallback('asc_onChangeDocumentProtection',_.bind(this.onChangeProtectDocument, this));
                this.api.asc_registerCallback('asc_onLockDocumentProtection',_.bind(this.onLockDocumentProtection, this));
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
                        props: me.appConfig,
                        handler: function(result, value, props) {
                            btn = result;
                            if (result == 'ok') {
                                var protection = me.api.asc_getDocumentProtection() || new AscCommonWord.CDocProtect();
                                protection.asc_setEditType(props);
                                protection.asc_setPassword(value);
                                me.api.asc_setDocumentProtection(protection);
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
                    props = me.api.asc_getDocumentProtection();
                if (props && props.asc_getIsPassword()) {
                    var win = new Common.Views.OpenDialog({
                        title: me.view.txtWBUnlockTitle,
                        closable: true,
                        type: Common.Utils.importTextType.DRM,
                        txtOpenFile: me.view.txtWBUnlockDescription,
                        validatePwd: false,
                        maxPasswordLength: 15,
                        handler: function (result, value) {
                            btn = result;
                            if (result == 'ok') {
                                if (me.api) {
                                    props.asc_setEditType(Asc.c_oAscEDocProtect.None);
                                    value && value.drmOptions && props.asc_setPassword(value.drmOptions.asc_getPassword());
                                    me.api.asc_setDocumentProtection(props);
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
                    if (!props)
                        props = new AscCommonWord.CDocProtect();
                    props.asc_setEditType(Asc.c_oAscEDocProtect.None);
                    me.api.asc_setDocumentProtection(props);
                }
            }
        },

        onAppReady: function (config) {
            if (!this.view) return;

            var me = this;
            (new Promise(function (resolve) {
                resolve();
            })).then(function () {
                var props = me.api.asc_getDocumentProtection(),
                    type = props ? props.asc_getEditType() : Asc.c_oAscEDocProtect.None,
                    isProtected = (type === Asc.c_oAscEDocProtect.ReadOnly || type === Asc.c_oAscEDocProtect.Comments ||
                                   type === Asc.c_oAscEDocProtect.TrackedChanges || type === Asc.c_oAscEDocProtect.Forms);
                me.view.btnProtectDoc.toggle(!!isProtected, true);
                props && me.applyRestrictions(type);
            });
        },

        onChangeProtectDocument: function() {
            var props = this.getDocProps(true),
                isProtected = props && (props.isReadOnly || props.isCommentsOnly || props.isFormsOnly || props.isReviewOnly);
            this.view && this.view.btnProtectDoc.toggle(isProtected, true);

            // off preview forms
            var forms = this.getApplication().getController('FormsTab');
            forms && forms.changeViewFormMode(false);

            // off preview review changes
            var review = this.getApplication().getController('Common.Controllers.ReviewChanges');
            if (review && review.isPreviewChangesMode()) {
                var value = Common.Utils.InternalSettings.get("de-review-mode-editor") || 'markup';
                review.turnDisplayMode(value);
                review.view && review.view.turnDisplayMode(value);
            }

            props && this.applyRestrictions(props.type);
            Common.NotificationCenter.trigger('protect:doclock', props);
        },

        getDocProps: function(update) {
            if (!this.appConfig || !this.appConfig.isEdit && !this.appConfig.isRestrictedEdit) return;

            if (update || !this._state.docProtection) {
                var props = this.api.asc_getDocumentProtection(),
                    type = props ? props.asc_getEditType() : Asc.c_oAscEDocProtect.None;
                this._state.docProtection = {
                    type: type,
                    isReadOnly: type===Asc.c_oAscEDocProtect.ReadOnly,
                    isCommentsOnly: type===Asc.c_oAscEDocProtect.Comments,
                    isReviewOnly: type===Asc.c_oAscEDocProtect.TrackedChanges,
                    isFormsOnly: type===Asc.c_oAscEDocProtect.Forms
                };
            }
            return this._state.docProtection;
        },

        applyRestrictions: function(type) {
            if (type === Asc.c_oAscEDocProtect.ReadOnly) {
                this.api.asc_setRestriction(Asc.c_oAscRestrictionType.View);
            } else if (type === Asc.c_oAscEDocProtect.Comments) {
                this.api.asc_setRestriction(this.appConfig.canComments ? Asc.c_oAscRestrictionType.OnlyComments : Asc.c_oAscRestrictionType.View);
            } else if (type === Asc.c_oAscEDocProtect.Forms) {
                this.api.asc_setRestriction(this.appConfig.canFillForms ? Asc.c_oAscRestrictionType.OnlyForms : Asc.c_oAscRestrictionType.View);
            } else { // none or tracked changes
                if (this.appConfig.isRestrictedEdit) {
                    this.appConfig.canComments && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyComments);
                    this.appConfig.canFillForms && this.api.asc_setRestriction(Asc.c_oAscRestrictionType.OnlyForms);
                } else
                    this.api.asc_setRestriction(Asc.c_oAscRestrictionType.None);
            }
            this.view && this.view.updateProtectionTips(type);
        },

        onLockDocumentProtection: function(state) {
            this.view && Common.Utils.lockControls(Common.enumLock.protectLock, state, {array: [this.view.btnProtectDoc]});
        }

    }, DE.Controllers.DocProtection || {}));
});