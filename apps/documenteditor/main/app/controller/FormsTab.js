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

            this.addListeners({
                'FormsTab': {
                    'forms:insert': this.onControlsSelect,
                    'forms:new-color': this.onNewControlsColor,
                    'forms:clear': this.onClearClick,
                    'forms:no-color': this.onNoControlsColor,
                    'forms:select-color': this.onSelectControlsColor,
                    'forms:mode': this.onModeClick
                }
            });
        },
        onLaunch: function () {
            this._state = {
                prcontrolsdisable:undefined,
                in_object: false
            };
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onFocusObject', this.onApiFocusObject.bind(this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
                Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
                // this.api.asc_registerCallback('asc_onShowContentControlsActions',_.bind(this.onShowContentControlsActions, this));
                // this.api.asc_registerCallback('asc_onHideContentControlsActions',_.bind(this.onHideContentControlsActions, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.view = this.createView('FormsTab', {
                toolbar: this.toolbar.toolbar
            });
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
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
                header_locked = false,
                in_header = false,
                in_equation = false,
                in_image = false,
                in_table = false,
                frame_pr = null;

            while (++i < selectedObjects.length) {
                type = selectedObjects[i].get_ObjectType();
                pr   = selectedObjects[i].get_ObjectValue();

                if (type === Asc.c_oAscTypeSelectElement.Paragraph) {
                    paragraph_locked = pr.get_Locked();
                    frame_pr = pr;
                } else if (type === Asc.c_oAscTypeSelectElement.Header) {
                    header_locked = pr.get_Locked();
                    in_header = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Image) {
                    in_image = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Math) {
                    in_equation = true;
                } else if (type === Asc.c_oAscTypeSelectElement.Table) {
                    in_table = true;
                }
            }
            this._state.prcontrolsdisable = paragraph_locked || header_locked;
            this._state.in_object = in_image || in_table || in_equation;

            var control_props = this.api.asc_IsContentControl() ? this.api.asc_GetContentControlProperties() : null,
                control_plain = (control_props) ? (control_props.get_ContentControlType()==Asc.c_oAscSdtLevelType.Inline) : false,
                lock_type = control_props ? control_props.get_Lock() : Asc.c_oAscSdtLockType.Unlocked,
                content_locked = lock_type==Asc.c_oAscSdtLockType.SdtContentLocked || lock_type==Asc.c_oAscSdtLockType.ContentLocked;
            var rich_del_lock = (frame_pr) ? !frame_pr.can_DeleteBlockContentControl() : false,
                rich_edit_lock = (frame_pr) ? !frame_pr.can_EditBlockContentControl() : false,
                plain_del_lock = (frame_pr) ? !frame_pr.can_DeleteInlineContentControl() : false,
                plain_edit_lock = (frame_pr) ? !frame_pr.can_EditInlineContentControl() : false;


            var need_disable = paragraph_locked || in_equation || in_image || in_header || control_plain || rich_edit_lock || plain_edit_lock;
        },

        onControlsSelect: function(type) {
            if (!(this.mode && this.mode.canFeatureContentControl)) return;

            if (item.value == 'settings' || item.value == 'remove') {
                if (this.api.asc_IsContentControl()) {
                    var props = this.api.asc_GetContentControlProperties();
                    if (props) {
                        var id = props.get_InternalId();
                        if (item.value == 'settings') {
                            var me = this;
                            (new DE.Views.ControlSettingsDialog({
                                props: props,
                                api: me.api,
                                controlLang: me._state.lang,
                                interfaceLang: me.mode.lang,
                                handler: function(result, value) {
                                    if (result == 'ok') {
                                        me.api.asc_SetContentControlProperties(value, id);
                                    }

                                    Common.NotificationCenter.trigger('edit:complete', me.toolbar);
                                }
                            })).show();

                        } else {
                            this.api.asc_RemoveContentControlWrapper(id);
                            Common.component.Analytics.trackEvent('ToolBar', 'Remove Content Control');
                        }
                    }
                }
            } else {
                var isnew = (item.value.indexOf('new-')==0),
                    oPr, oFormPr;
                if (isnew) {
                    oFormPr = new AscCommon.CSdtFormPr();
                    this.toolbar.fireEvent('insertcontrol', this.toolbar);
                }
                if (item.value == 'plain' || item.value == 'rich')
                    this.api.asc_AddContentControl((item.value=='plain') ? Asc.c_oAscSdtLevelType.Inline : Asc.c_oAscSdtLevelType.Block);
                else if (item.value.indexOf('picture')>=0)
                    this.api.asc_AddContentControlPicture(oFormPr);
                else if (item.value.indexOf('checkbox')>=0 || item.value.indexOf('radiobox')>=0) {
                    if (isnew) {
                        oPr = new AscCommon.CSdtCheckBoxPr();
                        (item.value.indexOf('radiobox')>=0) && oPr.put_GroupKey('Group 1');
                    }
                    this.api.asc_AddContentControlCheckBox(oPr, oFormPr);
                } else if (item.value == 'date')
                    this.api.asc_AddContentControlDatePicker();
                else if (item.value.indexOf('combobox')>=0 || item.value.indexOf('dropdown')>=0)
                    this.api.asc_AddContentControlList(item.value.indexOf('combobox')>=0, oPr, oFormPr);
                else if (item.value == 'new-field') {
                    oPr = new AscCommon.CSdtTextFormPr();
                    this.api.asc_AddContentControlTextForm(oPr, oFormPr);
                }

                Common.component.Analytics.trackEvent('ToolBar', 'Add Content Control');
            }

            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onModeClick: function(state) {
            if (this.api) {

            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onClearClick: function() {
            if (this.api) {
                // this.api.asc_ClearControls();
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onNewControlsColor: function() {
            this.view.mnuControlsColorPicker.addNewColor();
        },

        onNoControlsColor: function(item) {
            if (!item.isChecked())
                this.api.asc_SetGlobalContentControlShowHighlight(true, 220, 220, 220);
            else
                this.api.asc_SetGlobalContentControlShowHighlight(false);
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        },

        onSelectControlsColor: function(color) {
            var clr = Common.Utils.ThemeColor.getRgbColor(color);
            if (this.api) {
                this.api.asc_SetGlobalContentControlShowHighlight(true, clr.get_r(), clr.get_g(), clr.get_b());
            }
            Common.NotificationCenter.trigger('edit:complete', this.toolbar);
        }

    }, DE.Controllers.FormsTab || {}));
});