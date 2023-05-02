/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  FormsTab.js
 *
 *  Created by Julia Radzhabova on 06.10.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/main/app/view/FormsTab',
    'documenteditor/main/app/view/RolesManagerDlg',
    'documenteditor/main/app/view/SaveFormDlg'
], function () {
    'use strict';

    DE.Controllers.FormsTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'FormsTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
        },
        onLaunch: function () {
            this._state = {
                lastViewRole: undefined, // last selected role in the preview mode
                lastRoleInList: undefined // last role in the roles list
            };
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onFocusObject', this.onApiFocusObject.bind(this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                // this.api.asc_registerCallback('asc_onChangeSpecialFormsGlobalSettings', _.bind(this.onChangeSpecialFormsGlobalSettings, this));
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
                this.api.asc_registerCallback('asc_onStartAction', _.bind(this.onLongActionBegin, this));
                this.api.asc_registerCallback('asc_onEndAction', _.bind(this.onLongActionEnd, this));
                this.api.asc_registerCallback('asc_onError', _.bind(this.onError, this));
                this.api.asc_registerCallback('asc_onDownloadUrl', _.bind(this.onDownloadUrl, this));
                this.api.asc_registerCallback('asc_onUpdateOFormRoles', _.bind(this.onRefreshRolesList, this));

                // this.api.asc_registerCallback('asc_onShowContentControlsActions',_.bind(this.onShowContentControlsActions, this));
                // this.api.asc_registerCallback('asc_onHideContentControlsActions',_.bind(this.onHideContentControlsActions, this));
            }
            Common.NotificationCenter.on('protect:doclock', _.bind(this.onChangeProtectDocument, this));
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.appConfig = config.config;
            this.view = this.createView('FormsTab', {
                toolbar: this.toolbar.toolbar,
                config: config.config
            });
            this.addListeners({
                'FormsTab': {
                    'forms:insert': this.onControlsSelect,
                    'forms:clear': this.onClearClick,
                    // 'forms:no-color': this.onNoControlsColor,
                    // 'forms:select-color': this.onSelectControlsColor,
                    'forms:mode': this.onModeClick,
                    'forms:goto': this.onGoTo,
                    'forms:submit': this.onSubmitClick,
                    'forms:save': this.onSaveFormClick,
                    'forms:manager': this.onManagerClick
                },
                'Toolbar': {
                    'tab:active': this.onActiveTab
                }
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
            this.SetDisabled(true);
        },

        onApiFocusObject: function(selectedObjects) {
            if (!this.toolbar.editMode || this.appConfig.isRestrictedEdit) return;

            var pr, i = -1, type,
                paragraph_locked = false,
                header_locked = false,
                shape_pr = undefined;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = pr.get_Locked();
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    if (pr && pr.get_ShapeProperties())
                        shape_pr = pr.get_ShapeProperties();
                }
            }
            var in_control = this.api.asc_IsContentControl();
            var control_props = in_control ? this.api.asc_GetContentControlProperties() : null,
                lock_type = (in_control&&control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked,
                control_plain = (in_control&&control_props) ? (control_props.get_ContentControlType()===Asc.c_oAscSdtLevelType.Inline && !control_props.get_ComplexFormPr()) : false;
            (lock_type===undefined) && (lock_type = Asc.c_oAscSdtLockType.Unlocked);
            var content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked;
            var arr = [ this.view.btnTextField, this.view.btnComboBox, this.view.btnDropDown, this.view.btnCheckBox,
                        this.view.btnRadioBox, this.view.btnImageField, this.view.btnEmailField, this.view.btnPhoneField, this.view.btnComplexField,
                        this.view.btnCreditCard, this.view.btnZipCode, this.view.btnDateTime];
            Common.Utils.lockControls(Common.enumLock.paragraphLock, paragraph_locked,   {array: arr});
            Common.Utils.lockControls(Common.enumLock.headerLock,    header_locked,      {array: arr});
            // Common.Utils.lockControls(Common.enumLock.controlPlain,  control_plain,      {array: arr});
            // Common.Utils.lockControls(Common.enumLock.contentLock,   content_locked,     {array: arr});
            Common.Utils.lockControls(Common.enumLock.complexForm,   in_control && !!control_props && !!control_props.get_ComplexFormPr(),     {array: [this.view.btnComplexField, this.view.btnImageField]});

            var in_smart_art = shape_pr && shape_pr.asc_getFromSmartArt(),
                in_smart_art_internal = shape_pr && shape_pr.asc_getFromSmartArtInternal();
            Common.Utils.lockControls(Common.enumLock.inSmartart, in_smart_art, {array: arr});
            Common.Utils.lockControls(Common.enumLock.inSmartartInternal, in_smart_art_internal, {array: arr});
        },

        // onChangeSpecialFormsGlobalSettings: function() {
        //     if (this.view && this.view.mnuFormsColorPicker) {
        //         var clr = this.api.asc_GetSpecialFormsHighlightColor(),
        //             show = !!clr;
        //         this.view.mnuNoFormsColor.setChecked(!show, true);
        //         this.view.mnuFormsColorPicker.clearSelection();
        //         if (clr) {
        //             clr = Common.Utils.ThemeColor.getHexColor(clr.get_r(), clr.get_g(), clr.get_b());
        //             this.view.mnuFormsColorPicker.selectByRGB(clr, true);
        //         }
        //         this.view.btnHighlight.currentColor = clr;
        //         this.view.btnHighlight.setColor(this.view.btnHighlight.currentColor || 'transparent');
        //     }
        // },

        onControlsSelect: function(type, options) {
            if (!(this.toolbar.mode && this.toolbar.mode.canFeatureContentControl && this.toolbar.mode.canFeatureForms)) return;

            var oPr,
                oFormPr = new AscCommon.CSdtFormPr();
            oFormPr.put_Role(Common.Utils.InternalSettings.get('de-last-form-role') || this._state.lastRoleInList);
            this.toolbar.toolbar.fireEvent('insertcontrol', this.toolbar.toolbar);
            if (type == 'picture')
                this.api.asc_AddContentControlPicture(oFormPr);
            else if (type == 'checkbox' || type == 'radiobox') {
                oPr = new AscCommon.CSdtCheckBoxPr();
                (type == 'radiobox') && oPr.put_GroupKey(this.toolbar.textGroup + ' 1');
                this.api.asc_AddContentControlCheckBox(oPr, oFormPr);
            } else if (type == 'combobox' || type == 'dropdown')
                this.api.asc_AddContentControlList(type == 'combobox', oPr, oFormPr);
            else if (type == 'datetime'){
                var props = new AscCommon.CContentControlPr(),
                    datePr = new AscCommon.CSdtDatePickerPr();
                props.put_FormPr(oFormPr);
                props.put_DateTimePr(datePr);
                props.put_PlaceholderText(datePr.get_String());
                this.api.asc_AddContentControlDatePicker(props);
            } else if (type == 'text') {
                var props = new AscCommon.CContentControlPr();
                oPr = new AscCommon.CSdtTextFormPr();
                if (options) {
                    if (options.reg)
                        oPr.put_RegExpFormat(options.reg);
                    else if (options.mask)
                        oPr.put_MaskFormat(options.mask);
                    if (options.placeholder)
                        props.put_PlaceholderText(options.placeholder);
                    if (options.fixed!==undefined)
                        oFormPr.put_Fixed && oFormPr.put_Fixed(options.fixed);
                }
                props.put_TextFormPr(oPr);
                props.put_FormPr(oFormPr);
                this.api.asc_AddContentControlTextForm(props);
            } else if (type == 'complex') {
                this.api.asc_AddComplexForm();
            }

            var me = this;
            setTimeout(function() {
                me.showSaveFormTip();
            }, 500);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onModeClick: function(state, lastViewRole) {
            if (this.api) {
                this.disableEditing(state);
                this.view && this.view.setPreviewMode(state); // send role name - lastViewRole
                var role = new AscCommon.CRestrictionSettings();
                role.put_OFormRole(lastViewRole);
                this.api.asc_setRestriction(state ? Asc.c_oAscRestrictionType.OnlyForms : Asc.c_oAscRestrictionType.None, role);
                this.api.asc_SetPerformContentControlActionByClick(state);
                this.api.asc_SetHighlightRequiredFields(state);
                state && (this._state.lastViewRole = lastViewRole);
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        changeViewFormMode: function(state) {
            if (this.view && (state !== this.view.btnViewFormRoles.isActive())) {
                this.view.btnViewFormRoles.toggle(state, true);
                this.onModeClick(state);
            }
        },

        onClearClick: function() {
            if (this.api) {
                this.api.asc_ClearAllSpecialForms();
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        // onNoControlsColor: function(item) {
        //     if (!item.isChecked())
        //         this.api.asc_SetSpecialFormsHighlightColor(201, 200, 255);
        //     else
        //         this.api.asc_SetSpecialFormsHighlightColor();
        //     Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        // },

        // onSelectControlsColor: function(color) {
        //     var clr = Common.Utils.ThemeColor.getRgbColor(color);
        //     if (this.api) {
        //         this.api.asc_SetSpecialFormsHighlightColor(clr.get_r(), clr.get_g(), clr.get_b());
        //     }
        //     Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        // },

        onGoTo: function(type) {
            if (this.api)
                this.api.asc_MoveToFillingForm(type=='next');
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSubmitClick: function() {
            if (!this.api.asc_IsAllRequiredFormsFilled()) {
                var me = this;
                Common.UI.warning({
                    msg: this.view.textRequired,
                    callback: function() {
                        me.api.asc_MoveToFillingForm(true, true, true);
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                    }
                });
                return;
            }

            this.api.asc_SendForm();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSaveFormClick: function() {
            this.showRolesList(function() {
                this.isFromFormSaveAs = this.appConfig.canRequestSaveAs || !!this.appConfig.saveAsUrl;
                this.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.OFORM, this.isFromFormSaveAs));
            });
        },

        onDownloadUrl: function(url, fileType) {
            if (this.isFromFormSaveAs) {
                var me = this,
                    defFileName = this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption();
                !defFileName && (defFileName = me.view.txtUntitled);

                var idx = defFileName.lastIndexOf('.');
                if (idx>0)
                    defFileName = defFileName.substring(0, idx) + '.oform';

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

        disableEditing: function(disable) {
            if (this._state.DisabledEditing != disable) {
                this._state.DisabledEditing = disable;

                Common.NotificationCenter.trigger('editing:disable', disable, {
                    viewMode: false,
                    reviewMode: false,
                    fillFormMode: true,
                    allowMerge: false,
                    allowSignature: false,
                    allowProtect: false,
                    rightMenu: {clear: false, disable: true},
                    statusBar: true,
                    leftMenu: {disable: false, previewMode: true},
                    fileMenu: {info: true},
                    navigation: {disable: false, previewMode: true},
                    comments: {disable: false, previewMode: true},
                    chat: false,
                    review: true,
                    viewport: false,
                    documentHolder: {clear: false, disable: true},
                    toolbar: true,
                    plugins: true,
                    protect: true
                }, 'forms');
                // if (this.view)
                //     this.view.$el.find('.no-group-mask.form-view').css('opacity', 1);
            }
        },

        onLongActionBegin: function(type, id) {
            if (id==Asc.c_oAscAsyncAction['Submit'] && this.view.btnSubmit) {
                this._submitFail = false;
                this.submitedTooltip && this.submitedTooltip.hide();
                this.view.btnSubmit.setDisabled(true);
            }
        },

        onLongActionEnd: function(type, id) {
            if (id==Asc.c_oAscAsyncAction['Submit'] && this.view.btnSubmit) {
                this.view.btnSubmit.setDisabled(false);
                if (!this.submitedTooltip) {
                    this.submitedTooltip = new Common.UI.SynchronizeTip({
                        text: this.view.textSubmited,
                        extCls: 'no-arrow',
                        showLink: false,
                        target: $('.toolbar'),
                        placement: 'bottom'
                    });
                    this.submitedTooltip.on('closeclick', function () {
                        this.submitedTooltip.hide();
                    }, this);
                }
                !this._submitFail && this.submitedTooltip.show();
            }
        },

        onError: function(id, level, errData) {
            if (id==Asc.c_oAscError.ID.Submit) {
                this._submitFail = true;
                this.submitedTooltip && this.submitedTooltip.hide();
            }
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
                // if (config.canEditContentControl && me.view.btnHighlight) {
                //     var clr = me.api.asc_GetSpecialFormsHighlightColor();
                //     clr && (clr = Common.Utils.ThemeColor.getHexColor(clr.get_r(), clr.get_g(), clr.get_b()));
                //     me.view.btnHighlight.currentColor = clr;
                // }
                config.isEdit && config.canFeatureContentControl && config.isFormCreator && me.showCreateFormTip(); // show tip only when create form in docxf
                me.onRefreshRolesList();
                me.onChangeProtectDocument();
            });
        },

        showCreateFormTip: function() {
            if (!Common.localStorage.getItem("de-hide-createform-tip")) {
                var target = $('.toolbar').find('.ribtab [data-tab=forms]').parent();
                var tip = new Common.UI.SynchronizeTip({
                    extCls: 'colored',
                    placement: 'bottom-right',
                    target: target,
                    text: this.view.textCreateForm,
                    showLink: false,
                    closable: false,
                    showButton: true,
                    textButton: this.view.textGotIt
                });
                tip.on({
                    'buttonclick': function() {
                        Common.localStorage.setItem("de-hide-createform-tip", 1);
                        tip.close();
                    }
                });
                tip.show();
            }
        },

        showSaveFormTip: function() {
            if (this.view.btnSaveForm && !Common.localStorage.getItem("de-hide-saveform-tip") && !this.tipSaveForm) {
                var me = this;
                me.tipSaveForm = new Common.UI.SynchronizeTip({
                    extCls: 'colored',
                    placement: 'bottom-right',
                    target: this.view.btnSaveForm.$el,
                    text: this.view.tipSaveForm,
                    showLink: false,
                    closable: false,
                    showButton: true,
                    textButton: this.view.textGotIt
                });
                me.tipSaveForm.on({
                    'buttonclick': function() {
                        Common.localStorage.setItem("de-hide-saveform-tip", 1);
                        me.tipSaveForm.close();
                    }
                });
                me.tipSaveForm.show();
            }
        },

        onRefreshRolesList: function(roles) {
            if (!roles) {
                var oform = this.api.asc_GetOForm();
                oform && (roles = oform.asc_getAllRoles());
            }
            this._state.lastRoleInList = (roles && roles.length>0) ? roles[roles.length-1].asc_getSettings().asc_getName() : undefined;
            this.view && this.view.fillRolesMenu(roles, this._state.lastViewRole);
        },

        onManagerClick: function() {
            var me = this;
            this.api.asc_GetOForm() && (new DE.Views.RolesManagerDlg({
                api: me.api,
                handler: function(result, settings) {
                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                },
                props : undefined
            })).on('close', function(win){
            }).show();
        },

        showRolesList: function(callback) {
            var me = this,
                oform = this.api.asc_GetOForm();
            oform && (new DE.Views.SaveFormDlg({
                handler: function(result, settings) {
                    if (result=='ok')
                        callback.call(me);
                    else
                        Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                },
                roles: oform.asc_getAllRoles()
            })).show();
        },


        onActiveTab: function(tab) {
            if (tab !== 'forms') {
                this.tipSaveForm && this.tipSaveForm.close();
            }
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props) {
                this._state.docProtection = props;
                if (this.view) {
                    var arr = this.view.getButtons();
                    Common.Utils.lockControls(Common.enumLock.docLockView, props.isReadOnly,   {array: arr});
                    Common.Utils.lockControls(Common.enumLock.docLockForms, props.isFormsOnly,   {array: arr});
                    Common.Utils.lockControls(Common.enumLock.docLockReview, props.isReviewOnly,   {array: arr});
                    Common.Utils.lockControls(Common.enumLock.docLockComments, props.isCommentsOnly,   {array: arr});
                }
            }
        }

    }, DE.Controllers.FormsTab || {}));
});