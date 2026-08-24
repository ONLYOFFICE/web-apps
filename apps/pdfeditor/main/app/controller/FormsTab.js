/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 *  FormsTab.js
 *
 *  Created on 04.03.2025
 *
 */

define([
    'core',
], function () {
    'use strict';

    PDFE.Controllers.FormsTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        // views : [
        //     'FormsTab'
        // ],
        sdkViewName : '#id_main',

        initialize: function () {
        },
        onLaunch: function () {
            this._state = {
                lastViewRole: undefined, // last selected role in the preview mode
                lastRoleInList: undefined, // last role in the roles list,
            };
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onFocusObject', this.onApiFocusObject.bind(this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onUpdateOFormRoles', _.bind(this.onRefreshRolesList, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
                this.api.asc_registerCallback('asc_onDownloadUrl', _.bind(this.onDownloadUrl, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.appConfig = config.config;
            this.views = this.getApplication().getClasseRefs('view', ['FormsTab']);
            this.view = this.createView('FormsTab', {
                toolbar: this.toolbar.toolbar,
                config: config.config,
                api: this.api
            });
            var me = this;
            this.addListeners({
                'FormsTab': {
                    'forms:insert': this.onControlsSelect,
                    'forms:clear': this.onClearClick,
                    'forms:preview': this.onPreviewClick,
                    'forms:manager': this.onManagerClick,
                    'forms:currentrole': this.onCurrentRole
                },
                'Toolbar': {
                    'tab:active': this.onActiveTab,
                    'tab:collapse': this.onTabCollapse,
                    'view:compact'  : function (toolbar, state) {
                        state && me.onTabCollapse();
                    },
                },
                'FormSettings': {
                    'forms:currentrole': this.onCurrentRoleChanged
                }
            });
            this.appConfig.canSwitchMode && this.api && this.api.asc_registerCallback('asc_onOFormChangeFinal', _.bind(this.onOFormChangeFinal, this))
            Common.NotificationCenter.on('forms:request-fill',          _.bind(this.requestStartFilling, this));
            Common.NotificationCenter.on('forms:show-send-for-signing', _.bind(this.showSendForSigning, this));
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

        getCurrentViewRole: function() {
            return this._state.lastViewRole;
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        },

        onCurrentRole: function (combo, record) {
            const me = this;

            if (!this.api) return;
            if (record.value === 0) {
                combo.setValue(Common.Utils.InternalSettings.get('pdfe-last-form-role') || this._state.lastRoleInList);

                const formManager = this.api.asc_GetOForm();

                new Common.Views.RoleEditDlg({
                    oformManager: formManager,
                    colors: [],
                    isEdit: false,
                    handler: function (result, settings) {
                        if (result === 'ok' && settings) {
                            formManager.asc_addRole(settings.name, settings.color);
                            me.api.asc_assignFieldToRole(settings.name);
                            Common.Utils.InternalSettings.set('pdfe-last-form-role', settings.name);
                            combo.setValue(Common.Utils.InternalSettings.get('pdfe-last-form-role'));
                        }
                    }
                }).on('close', () => {
                    this.fireEvent('editcomplete', this);
                }).show();
            } else {
                Common.Utils.InternalSettings.set('pdfe-last-form-role', record.value)
                this.fireEvent('editcomplete', this);
            }
        },

        onCurrentRoleChanged: function() {
            this.view && this.view.cmbRoles && this.view.cmbRoles.setValue(Common.Utils.InternalSettings.get('pdfe-last-form-role'));
        },

        onRefreshRolesList: function(roles) {
            if (!Common.UI.FeaturesManager.isFeatureEnabled('roles', true)) return;

            if (!roles) {
                const oform = this.api.asc_GetOForm();
                oform && (roles = oform.asc_getAllRoles());
            }
            this._state.lastRoleInList = (roles && roles.length>0) ? roles[roles.length-1].asc_getSettings().asc_getName() : undefined;
            if (this.view) {
                this.view.fillRolesMenu(roles, this._state.lastViewRole);
                this.view.fillFillForCombo(roles, this._state.lastRoleInList);
            }
        },

        onApiFocusObject: function(selectedObjects) {
            if (!this.toolbar.editMode) return;

            var pr, i = -1, type,
                paragraph_locked = false,
                shape_pr = undefined;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    if (pr && pr.get_ShapeProperties())
                        shape_pr = pr.get_ShapeProperties();
                }
            }
            var arr = [ this.view.btnTextField, this.view.btnComboBox, this.view.btnDropDown, this.view.btnCheckBox,
                        this.view.btnRadioBox, this.view.btnImageField, this.view.btnSignatureField, this.view.btnEmailField, this.view.btnPhoneField,
                        this.view.btnCreditCard, this.view.btnZipCode, this.view.btnDateTime];
            Common.Utils.lockControls(Common.enumLock.paragraphLock, paragraph_locked,   {array: arr});

            var in_smart_art = shape_pr && shape_pr.asc_getFromSmartArt(),
                in_smart_art_internal = shape_pr && shape_pr.asc_getFromSmartArtInternal();
            Common.Utils.lockControls(Common.enumLock.inSmartart, in_smart_art, {array: arr});
            Common.Utils.lockControls(Common.enumLock.inSmartartInternal, in_smart_art_internal, {array: arr});
        },

        onControlsSelect: function(type, options) {
            if (!(this.toolbar.mode && this.toolbar.mode.canFeatureForms)) return;

            this.toolbar.toolbar.fireEvent('insertcontrol', this.toolbar.toolbar);
            if (type == 'picture')
                this.api.AddImageField();
            else if (type == 'signature')
                this.api.AddSignatureField();
            else if (type == 'checkbox')
                this.api.AddCheckboxField();
            else if (type == 'radiobox')
                this.api.AddRadiobuttonField();
            else if (type == 'combobox')
                this.api.AddComboboxField();
            else if (type == 'dropdown')
                this.api.AddListboxField();
            else if (type == 'datetime'){
                this.api.AddDateField();
            } else if (type == 'text') {
                this.api.AddTextField(options);
            }
            this.api.asc_assignFieldToRole(Common.Utils.InternalSettings.get('pdfe-last-form-role') || this._state.lastRoleInList);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClearClick: function() {
            if (this.api) {
                this.api.asc_ClearAllSpecialForms();
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onManagerClick: function() {
            const me = this;
            (new Common.Views.RolesManagerDlg({
                api: me.api,
                handler: function(result, settings) {
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                },
                props : undefined
            })).show();
        },

        onPreviewClick: function(isPreview, lastViewRole) {
            isPreview && lastViewRole && (this._state.lastViewRole = lastViewRole);
            this.view._state.lastViewRole = lastViewRole;
            Common.NotificationCenter.trigger('pdf:mode-apply', isPreview ? 'comment' : 'edit');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onFinalClick: function(state) {
            this.api && this.api.asc_markAsFinal(state);
            PDFE.getController('Main').onPdfModeApply(state ? 'view' : 'edit');
        },

        onOFormChangeFinal: function(isFinal) {
            // off preview review changes
            var review = this.getApplication().getController('Common.Controllers.ReviewChanges');
            if (review && review.isPreviewChangesMode()) {
                var value = Common.Utils.InternalSettings.get("de-review-mode-editor") || Asc.c_oAscDisplayModeInReview.Edit;
                review.turnDisplayMode(value);
                review.view && review.view.turnDisplayMode(value);
            }

            this.onFinalClick(isFinal, false);
        },
        
        requestStartFilling: function() {
            var oform = this.api.asc_GetOForm(),
                roles = oform ? oform.asc_getAllRoles() : [],
                arr = [];
            for (var i=0; i<roles.length; i++) {
                var role = roles[i].asc_getSettings(),
                    color = role.asc_getColor();
                color && (color = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()));
                arr.push({
                    name: role.asc_getName() || this.view.textAnyone,
                    color: '#' + color
                });
            }
            Common.Gateway.requestStartFilling(arr);
        },

        showSendForSigning: function() {
            const rightmenuController = this.getApplication().getController('RightMenu');
            rightmenuController.openSendForSigning();
        },

        onDownloadUrl: function(url, fileType) {
            if (this.isFromFormSaveAs) {
                var me = this,
                    defFileName = this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption();
                !defFileName && (defFileName = me.view.txtUntitled);

                var idx = defFileName.lastIndexOf('.');
                if (idx>0)
                    defFileName = defFileName.substring(0, idx) + '.pdf';

                if (me.appConfig.canRequestSaveAs) {
                    Common.Gateway.requestSaveAs(url, defFileName, fileType);
                } else {
                    me._saveCopyDlg = new Common.Views.SaveAsDlg({
                        saveFolderUrl: me.appConfig.saveAsUrl,
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
            this.isFromFormSaveAs = false;
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
            
            });
            this.onRefreshRolesList();
        },

        onActiveTab: function(tab) {
            (tab !== 'forms') && this.onTabCollapse();
        },

        onTabCollapse: function(tab) {
        },

        onRightMenuClick: function(menu, type, minimized, event) {
        }

    }, PDFE.Controllers.FormsTab || {}));
});