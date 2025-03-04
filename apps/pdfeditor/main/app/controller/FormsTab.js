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
 *  FormsTab.js
 *
 *  Created on 04.03.2025
 *
 */

define([
    'core',
    'pdfeditor/main/app/view/FormsTab'
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
            this._state = {};
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onFocusObject', this.onApiFocusObject.bind(this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
                this.api.asc_registerCallback('asc_onStartAction', _.bind(this.onLongActionBegin, this));
                this.api.asc_registerCallback('asc_onEndAction', _.bind(this.onLongActionEnd, this));
                this.api.asc_registerCallback('asc_onError', _.bind(this.onError, this));
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
                    'forms:submit': this.onSubmitClick,
                    'forms:save': this.onSaveFormClick,
                },
                'Toolbar': {
                    'tab:active': this.onActiveTab,
                    'tab:collapse': this.onTabCollapse,
                    'view:compact'  : function (toolbar, state) {
                        state && me.onTabCollapse();
                    },
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
                        this.view.btnRadioBox, this.view.btnImageField, this.view.btnEmailField, this.view.btnPhoneField,
                        this.view.btnCreditCard, this.view.btnZipCode, this.view.btnDateTime];
            Common.Utils.lockControls(Common.enumLock.paragraphLock, paragraph_locked,   {array: arr});

            var in_smart_art = shape_pr && shape_pr.asc_getFromSmartArt(),
                in_smart_art_internal = shape_pr && shape_pr.asc_getFromSmartArtInternal();
            Common.Utils.lockControls(Common.enumLock.inSmartart, in_smart_art, {array: arr});
            Common.Utils.lockControls(Common.enumLock.inSmartartInternal, in_smart_art_internal, {array: arr});
        },

        onControlsSelect: function(type, options) {
            if (!(this.toolbar.mode && this.toolbar.mode.canFeatureForms)) return;

            var oPr,
                oFormPr = new AscCommon.CSdtFormPr();
            this.toolbar.toolbar.fireEvent('insertcontrol', this.toolbar.toolbar);
            if (type == 'picture')
                this.api.AddImageField();
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
                this.api.AddTextField();
                // var props = new AscCommon.CContentControlPr();
                // oPr = new AscCommon.CSdtTextFormPr();
                // if (options) {
                //     if (options.reg)
                //         oPr.put_RegExpFormat(options.reg);
                //     else if (options.mask)
                //         oPr.put_MaskFormat(options.mask);
                //     if (options.placeholder)
                //         props.put_PlaceholderText(options.placeholder);
                //     if (options.fixed!==undefined)
                //         oFormPr.put_Fixed && oFormPr.put_Fixed(options.fixed);
                // }
                // props.put_TextFormPr(oPr);
                // props.put_FormPr(oFormPr);
                // this.api.asc_AddContentControlTextForm(props);
            }
            // else if (type === 'signature')
            //     this.api.asc_AddContentControlSignature(oFormPr);

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClearClick: function() {
            if (this.api) {
                this.api.asc_ClearAllSpecialForms();
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSubmitClick: function() {
            if (!this.api.asc_IsAllRequiredFormsFilled()) {
                this.api.asc_MoveToFillingForm(true, true, true);
                Common.NotificationCenter.trigger('edit:complete', this.toolbar);
                return;
            }

            this.api.asc_SendForm();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSaveFormClick: function() {
            var me = this,
                callback = function() {
                    if (me.appConfig.isOffline)
                        me.api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                    else {
                        me.isFromFormSaveAs = me.appConfig.canRequestSaveAs || !!me.appConfig.saveAsUrl;
                        var options = new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF, me.isFromFormSaveAs);
                        options.asc_setIsSaveAs(me.isFromFormSaveAs);
                        me.api.asc_DownloadAs(options);
                    }
                };
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

        onLongActionBegin: function(type, id) {
            if (id==Asc.c_oAscAsyncAction['Submit'] && this.view.btnSubmit) {
                this._submitFail = false;
                this.submitedTooltip && this.submitedTooltip.hide();
                Common.Utils.lockControls(Common.enumLock.submit, true, {array: [this.view.btnSubmit]})
            }
        },

        onLongActionEnd: function(type, id) {
            if (id==Asc.c_oAscAsyncAction['Submit'] && this.view.btnSubmit) {
                Common.Utils.lockControls(Common.enumLock.submit, !this._submitFail, {array: [this.view.btnSubmit]});
                if (!this._submitFail) {
                    Common.Gateway.submitForm();
                    this.view.btnSubmit.setCaption(this.view.textFilled);
                    var text = (typeof this.appConfig.customization.submitForm==='object') ? this.appConfig.customization.submitForm.resultMessage : this.view.textSubmitOk;
                    if (text==='') return;
                    if (!this.submitedTooltip) {
                        this.submitedTooltip = new Common.UI.SynchronizeTip({
                            text: text || this.view.textSubmitOk,
                            extCls: 'no-arrow colored',
                            showLink: false,
                            target: $('.toolbar'),
                            placement: 'bottom'
                        });
                        this.submitedTooltip.on('closeclick', function () {
                            this.submitedTooltip.hide();
                        }, this);
                    }
                    this.submitedTooltip.show();
                }
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
            });
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