/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  FormsTab.js
 *
 *  Created by Julia Radzhabova on 06.10.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/main/app/view/FormsTab'
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
                prcontrolsdisable:undefined
            };
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onFocusObject', this.onApiFocusObject.bind(this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                this.api.asc_registerCallback('asc_onChangeSpecialFormsGlobalSettings', _.bind(this.onChangeSpecialFormsGlobalSettings, this));
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
                this.api.asc_registerCallback('asc_onStartAction', _.bind(this.onLongActionBegin, this));
                this.api.asc_registerCallback('asc_onEndAction', _.bind(this.onLongActionEnd, this));
                this.api.asc_registerCallback('asc_onError', _.bind(this.onError, this));

                // this.api.asc_registerCallback('asc_onShowContentControlsActions',_.bind(this.onShowContentControlsActions, this));
                // this.api.asc_registerCallback('asc_onHideContentControlsActions',_.bind(this.onHideContentControlsActions, this));
            }
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
                    'forms:new-color': this.onNewControlsColor,
                    'forms:clear': this.onClearClick,
                    'forms:no-color': this.onNoControlsColor,
                    'forms:select-color': this.onSelectControlsColor,
                    'forms:mode': this.onModeClick,
                    'forms:goto': this.onGoTo,
                    'forms:submit': this.onSubmitClick
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
                header_locked = false;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = pr.get_Locked();
                }
            }
            var in_control = this.api.asc_IsContentControl();
            var control_props = in_control ? this.api.asc_GetContentControlProperties() : null,
                lock_type = (in_control&&control_props) ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked,
                control_plain = (in_control&&control_props) ? (control_props.get_ContentControlType()==Asc.c_oAscSdtLevelType.Inline) : false;
            (lock_type===undefined) && (lock_type = Asc.c_oAscSdtLockType.Unlocked);
            var content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked;
            var need_disable = (paragraph_locked || header_locked || control_plain || content_locked);
            if (this._state.prcontrolsdisable !== need_disable) {
                this.view.btnTextField.setDisabled(need_disable);
                this.view.btnComboBox.setDisabled(need_disable);
                this.view.btnDropDown.setDisabled(need_disable);
                this.view.btnCheckBox.setDisabled(need_disable);
                this.view.btnRadioBox.setDisabled(need_disable);
                this.view.btnImageField.setDisabled(need_disable);
                this.view.btnTextField.setDisabled(need_disable);
                this._state.prcontrolsdisable = need_disable;
            }
        },

        onChangeSpecialFormsGlobalSettings: function() {
            if (this.view && this.view.mnuFormsColorPicker) {
                var clr = this.api.asc_GetSpecialFormsHighlightColor(),
                    show = !!clr;
                this.view.mnuNoFormsColor.setChecked(!show, true);
                this.view.mnuFormsColorPicker.clearSelection();
                if (clr) {
                    clr = Common.Utils.ThemeColor.getHexColor(clr.get_r(), clr.get_g(), clr.get_b());
                    this.view.mnuFormsColorPicker.selectByRGB(clr, true);
                }
                this.view.btnHighlight.currentColor = clr;
                this.view.btnHighlight.setColor(this.view.btnHighlight.currentColor || 'transparent');
            }
        },

        onControlsSelect: function(type) {
            if (!(this.toolbar.mode && this.toolbar.mode.canFeatureContentControl && this.toolbar.mode.canFeatureForms)) return;

            var oPr,
                oFormPr = new AscCommon.CSdtFormPr();
            this.toolbar.toolbar.fireEvent('insertcontrol', this.toolbar.toolbar);
            if (type == 'picture')
                this.api.asc_AddContentControlPicture(oFormPr);
            else if (type == 'checkbox' || type == 'radiobox') {
                oPr = new AscCommon.CSdtCheckBoxPr();
                (type == 'radiobox') && oPr.put_GroupKey(this.toolbar.textGroup + ' 1');
                this.api.asc_AddContentControlCheckBox(oPr, oFormPr);
            } else if (type == 'combobox' || type == 'dropdown')
                this.api.asc_AddContentControlList(type == 'combobox', oPr, oFormPr);
            else if (type == 'text') {
                oPr = new AscCommon.CSdtTextFormPr();
                this.api.asc_AddContentControlTextForm(oPr, oFormPr);
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onModeClick: function(state) {
            if (this.api) {
                this.disableEditing(state);
                this.api.asc_setRestriction(state ? Asc.c_oAscRestrictionType.OnlyForms : Asc.c_oAscRestrictionType.None);
                this.api.asc_SetPerformContentControlActionByClick(state);
                this.api.asc_SetHighlightRequiredFields(state);
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClearClick: function() {
            if (this.api) {
                this.api.asc_ClearAllSpecialForms();
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onNewControlsColor: function() {
            this.view.mnuFormsColorPicker.addNewColor();
        },

        onNoControlsColor: function(item) {
            if (!item.isChecked())
                this.api.asc_SetSpecialFormsHighlightColor(201, 200, 255);
            else
                this.api.asc_SetSpecialFormsHighlightColor();
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSelectControlsColor: function(color) {
            var clr = Common.Utils.ThemeColor.getRgbColor(color);
            if (this.api) {
                this.api.asc_SetSpecialFormsHighlightColor(clr.get_r(), clr.get_g(), clr.get_b());
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

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

        disableEditing: function(disable) {
            if (this._state.DisabledEditing != disable) {
                this._state.DisabledEditing = disable;

                var app = this.getApplication();
                var rightMenuController = app.getController('RightMenu');
                rightMenuController.getView('RightMenu').clearSelection();
                rightMenuController.SetDisabled(disable);
                app.getController('Toolbar').DisableToolbar(disable, false, false, true);
                app.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
                app.getController('Common.Controllers.ReviewChanges').SetDisabled(disable);
                app.getController('DocumentHolder').getView().SetDisabled(disable);
                app.getController('Navigation') && app.getController('Navigation').SetDisabled(disable);
                app.getController('LeftMenu').setPreviewMode(disable);
                var comments = app.getController('Common.Controllers.Comments');
                if (comments)
                    comments.setPreviewMode(disable);
                if (this.view)
                    this.view.$el.find('.no-group-mask.form-view').css('opacity', 1);
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
                if (config.canEditContentControl && me.view.btnHighlight) {
                    var clr = me.api.asc_GetSpecialFormsHighlightColor();
                    clr && (clr = Common.Utils.ThemeColor.getHexColor(clr.get_r(), clr.get_g(), clr.get_b()));
                    me.view.btnHighlight.currentColor = clr;
                }
            });
        }

    }, DE.Controllers.FormsTab || {}));
});