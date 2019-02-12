/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 *  RightMenu.js
 *
 *  Created by Julia Radzhabova on 1/17/14
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/main/app/view/RightMenu'
], function () {
    'use strict';

    DE.Controllers.RightMenu = Backbone.Controller.extend({
        models: [],
        collections: [],
        views: [
            'RightMenu'
        ],

        initialize: function() {
            this.editMode = true;

            this.addListeners({
                'RightMenu': {
                    'rightmenuclick': this.onRightMenuClick
                }
            });
        },

        onLaunch: function() {
            this.rightmenu = this.createView('RightMenu');

            this.rightmenu.on('render:after', _.bind(this.onRightMenuAfterRender, this));
        },

        onRightMenuAfterRender: function(rightMenu) {
            rightMenu.shapeSettings.application = rightMenu.textartSettings.application = this.getApplication();

            this._settings = [];
            this._settings[Common.Utils.documentSettingsType.Paragraph] = {panelId: "id-paragraph-settings",  panel: rightMenu.paragraphSettings,btn: rightMenu.btnText,        hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Table] =     {panelId: "id-table-settings",      panel: rightMenu.tableSettings,    btn: rightMenu.btnTable,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Image] =     {panelId: "id-image-settings",      panel: rightMenu.imageSettings,    btn: rightMenu.btnImage,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Header] =    {panelId: "id-header-settings",     panel: rightMenu.headerSettings,   btn: rightMenu.btnHeaderFooter,hidden: 1, locked: false, needShow: true};
            this._settings[Common.Utils.documentSettingsType.Shape] =     {panelId: "id-shape-settings",      panel: rightMenu.shapeSettings,    btn: rightMenu.btnShape,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.TextArt] =   {panelId: "id-textart-settings",    panel: rightMenu.textartSettings,  btn: rightMenu.btnTextArt,     hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Chart] = {panelId: "id-chart-settings",          panel: rightMenu.chartSettings,    btn: rightMenu.btnChart,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.MailMerge] = {panelId: "id-mail-merge-settings", panel: rightMenu.mergeSettings,    btn: rightMenu.btnMailMerge,   hidden: 1, props: {}, locked: false};
            this._settings[Common.Utils.documentSettingsType.Signature] = {panelId: "id-signature-settings",  panel: rightMenu.signatureSettings, btn: rightMenu.btnSignature,  hidden: 1, props: {}, locked: false};
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onUpdateSignatures', _.bind(this.onApiUpdateSignatures, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onCoAuthoringDisconnect, this));
        },

        setMode: function(mode) {
            this.editMode = mode.isEdit;
        },

        onRightMenuClick: function(menu, type, minimized) {
            if (!minimized && this.editMode) {
                var panel = this._settings[type].panel;
                var props = this._settings[type].props;
                if (props && panel)
                    panel.ChangeSettings.call(panel, (type==Common.Utils.documentSettingsType.MailMerge || type==Common.Utils.documentSettingsType.Signature) ? undefined : props);
            } else if (minimized && type==Common.Utils.documentSettingsType.MailMerge) {
                this.rightmenu.mergeSettings.disablePreviewMode();
            }
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            this.rightmenu.fireEvent('editcomplete', this.rightmenu);
        },

        onFocusObject: function(SelectedObjects, open) {
            if (!this.editMode)
                return;

            var can_add_table = false, 
                in_equation = false,
                needhide = true;
            for (var i=0; i<this._settings.length; i++) {
                if (i==Common.Utils.documentSettingsType.MailMerge || i==Common.Utils.documentSettingsType.Signature) continue;
                if (this._settings[i]) {
                    this._settings[i].hidden = 1;
                    this._settings[i].locked = false;
                }
            }
            this._settings[Common.Utils.documentSettingsType.MailMerge].locked = false;
            this._settings[Common.Utils.documentSettingsType.Signature].locked = false;

            var isChart = false;
            for (i=0; i<SelectedObjects.length; i++)
            {
                var eltype = SelectedObjects[i].get_ObjectType(),
                    settingsType = this.getDocumentSettingsType(eltype);
                if (eltype === Asc.c_oAscTypeSelectElement.Math)
                    in_equation = true;

                if (settingsType===undefined || settingsType>=this._settings.length || this._settings[settingsType]===undefined)
                    continue;

                var value = SelectedObjects[i].get_ObjectValue();
                if (settingsType == Common.Utils.documentSettingsType.Image) {
                    if (value.get_ChartProperties() !== null) {
                        isChart = true;
                        settingsType = Common.Utils.documentSettingsType.Chart;
                    } else if (value.get_ShapeProperties() !== null) {
                        isChart = value.get_ShapeProperties().get_FromChart();
                        settingsType = Common.Utils.documentSettingsType.Shape;
                        if (value.get_ShapeProperties().asc_getTextArtProperties()) {
                            this._settings[Common.Utils.documentSettingsType.TextArt].props = value;
                            this._settings[Common.Utils.documentSettingsType.TextArt].hidden = 0;
                            this._settings[Common.Utils.documentSettingsType.TextArt].locked = value.get_Locked();
                        }
                    }
                } else if (settingsType == Common.Utils.documentSettingsType.Paragraph) {
                    this._settings[settingsType].panel.isChart = isChart;
                    can_add_table = value.get_CanAddTable();
                }
                this._settings[settingsType].props = value;
                this._settings[settingsType].hidden = 0;
                this._settings[settingsType].locked = value.get_Locked();
                if (!this._settings[Common.Utils.documentSettingsType.MailMerge].locked) // lock MailMerge-InsertField, если хотя бы один объект locked
                    this._settings[Common.Utils.documentSettingsType.MailMerge].locked = value.get_Locked();
                if (!this._settings[Common.Utils.documentSettingsType.Signature].locked) // lock Signature, если хотя бы один объект locked
                    this._settings[Common.Utils.documentSettingsType.Signature].locked = value.get_Locked();
            }

            if ( this._settings[Common.Utils.documentSettingsType.Header].locked ) { // если находимся в locked header/footer, то считаем, что все элементы в нем тоже недоступны
                for (i=0; i<this._settings.length; i++)  {
                    if (this._settings[i])
                        this._settings[i].locked = true;
                }
            }

            if (!this._settings[Common.Utils.documentSettingsType.MailMerge].locked) { // disable MailMerge-InsertField when disable btnInsertTable
                this._settings[Common.Utils.documentSettingsType.MailMerge].locked = !can_add_table || in_equation;
            }

            var lastactive = -1, currentactive, priorityactive = -1,
                activePane = this.rightmenu.GetActivePane();
            for (i=0; i<this._settings.length; i++) {
                var pnl = this._settings[i];
                if (pnl===undefined || pnl.btn===undefined || pnl.panel===undefined) continue;

                if ( pnl.hidden ) {
                    if (!pnl.btn.isDisabled()) pnl.btn.setDisabled(true);
                    if (activePane == pnl.panelId)
                        currentactive = -1;
                } else {
                    if (pnl.btn.isDisabled()) pnl.btn.setDisabled(false);
                    if (i!=Common.Utils.documentSettingsType.MailMerge && i!=Common.Utils.documentSettingsType.Signature) lastactive = i;
                    if ( pnl.needShow ) {
                        pnl.needShow = false;
                        priorityactive = i;
                    } else if (activePane == pnl.panelId)
                        currentactive = i;
                    pnl.panel.setLocked(pnl.locked);
                }
            }
            if (!this._settings[Common.Utils.documentSettingsType.MailMerge].hidden)
                this._settings[Common.Utils.documentSettingsType.MailMerge].panel.setLocked(this._settings[Common.Utils.documentSettingsType.MailMerge].locked);

            if (!this.rightmenu.minimizedMode || open) {
                var active;

                if (priorityactive>-1) active = priorityactive;
                else if (lastactive>=0 && currentactive<0) active = lastactive;
                else if (currentactive>=0) active = currentactive;
                else if (!this._settings[Common.Utils.documentSettingsType.MailMerge].hidden) active = Common.Utils.documentSettingsType.MailMerge;

                if (active == undefined && open && lastactive>=0)
                    active = lastactive;
                
                if (active !== undefined) {
                    this.rightmenu.SetActivePane(active, open);
                    if (active!=Common.Utils.documentSettingsType.MailMerge && active!=Common.Utils.documentSettingsType.Signature)
                        this._settings[active].panel.ChangeSettings.call(this._settings[active].panel, this._settings[active].props);
                    else
                        this._settings[active].panel.ChangeSettings.call(this._settings[active].panel);
                }
            }

            this._settings[Common.Utils.documentSettingsType.Image].needShow = false;
            this._settings[Common.Utils.documentSettingsType.Chart].needShow = false;
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true, false);
        },

        onInsertTable:  function() {
            this._settings[Common.Utils.documentSettingsType.Table].needShow = true;
        },

        onInsertImage:  function() {
            this._settings[Common.Utils.documentSettingsType.Image].needShow = true;
        },

        onInsertChart:  function() {
            this._settings[Common.Utils.documentSettingsType.Chart].needShow = true;
        },

        onInsertShape:  function() {
            this._settings[Common.Utils.documentSettingsType.Shape].needShow = true;
        },

        onInsertTextArt:  function() {
            this._settings[Common.Utils.documentSettingsType.TextArt].needShow = true;
        },

        UpdateThemeColors:  function() {
            this.rightmenu.paragraphSettings.UpdateThemeColors();
            this.rightmenu.tableSettings.UpdateThemeColors();
            this.rightmenu.shapeSettings.UpdateThemeColors();
            this.rightmenu.textartSettings.UpdateThemeColors();
        },

        fillTextArt:  function() {
            this.rightmenu.textartSettings.fillTextArt();
        },

        updateMetricUnit: function() {
            this.rightmenu.headerSettings.updateMetricUnit();
            this.rightmenu.paragraphSettings.updateMetricUnit();
            this.rightmenu.chartSettings.updateMetricUnit();
            this.rightmenu.imageSettings.updateMetricUnit();
            this.rightmenu.tableSettings.updateMetricUnit();
        },

        createDelayedElements: function() {
            var me = this;
            if (this.api) {
                this.api.asc_registerCallback('asc_onFocusObject',       _.bind(this.onFocusObject, this));
                this.api.asc_registerCallback('asc_doubleClickOnObject', _.bind(this.onDoubleClickOnObject, this));
                if (this.rightmenu.mergeSettings) {
                    this.rightmenu.mergeSettings.setDocumentName(this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption());
                    this.api.asc_registerCallback('asc_onStartMailMerge',    _.bind(this.onStartMailMerge, this));
                }
                this.api.asc_registerCallback('asc_onError',             _.bind(this.onError, this));
            }

            if (this.editMode && this.api) {
                this.rightmenu.shapeSettings.createDelayedElements();
                var selectedElements = this.api.getSelectedElements();
                if (selectedElements.length>0) {
                    this.onFocusObject(selectedElements, !Common.localStorage.getBool("de-hide-right-settings", this.rightmenu.defaultHideRightMenu));
                }
            }
        },

        onDoubleClickOnObject: function(obj) {
            if (!this.editMode) return;

            var eltype = obj.get_ObjectType(),
                settingsType = this.getDocumentSettingsType(eltype);

            if (settingsType===undefined || settingsType>=this._settings.length || this._settings[settingsType]===undefined)
                return;

            var value = obj.get_ObjectValue();
            if (settingsType == Common.Utils.documentSettingsType.Image) {
                if (value.get_ChartProperties() !== null) {
                    settingsType = Common.Utils.documentSettingsType.Chart;
                } else if (value.get_ShapeProperties() !== null) {
                    settingsType = Common.Utils.documentSettingsType.Shape;
                }
            }

            if (settingsType !== Common.Utils.documentSettingsType.Paragraph) {
                this.rightmenu.SetActivePane(settingsType, true);
                this._settings[settingsType].panel.ChangeSettings.call(this._settings[settingsType].panel, this._settings[settingsType].props);
            }
        },

        onStartMailMerge: function() {
            var type = Common.Utils.documentSettingsType.MailMerge;
            this._settings[type].hidden = 0;
            this._settings[type].btn.setDisabled(false);
            this.rightmenu.SetActivePane(type, true);
            this._settings[type].panel.setLocked(this._settings[type].locked);
            this._settings[type].panel.ChangeSettings.call(this._settings[type].panel);
        },

        onError: function(id, level, errData) {
            if (id==Asc.c_oAscError.ID.MailMergeLoadFile) {
                this._settings[Common.Utils.documentSettingsType.MailMerge].hidden = 1;
                this._settings[Common.Utils.documentSettingsType.MailMerge].btn.setDisabled(true);
                var selectedElements = this.api.getSelectedElements();
                if (selectedElements.length>0)
                    this.onFocusObject(selectedElements);
            }
        },

        onApiUpdateSignatures: function(valid, requested){
            if (!this.rightmenu.signatureSettings) return;

            var disabled = (!valid || valid.length<1) && (!requested || requested.length<1),
                type = Common.Utils.documentSettingsType.Signature;
            this._settings[type].hidden = disabled ? 1 : 0;
            this._settings[type].btn.setDisabled(disabled);
            this._settings[type].panel.setLocked(this._settings[type].locked);
        },

        SetDisabled: function(disabled, allowMerge, allowSignature) {
            this.setMode({isEdit: !disabled});
            if (this.rightmenu) {
                this.rightmenu.paragraphSettings.disableControls(disabled);
                this.rightmenu.shapeSettings.disableControls(disabled);
                this.rightmenu.textartSettings.disableControls(disabled);
                this.rightmenu.headerSettings.disableControls(disabled);
                this.rightmenu.tableSettings.disableControls(disabled);
                this.rightmenu.imageSettings.disableControls(disabled);
                if (!allowMerge && this.rightmenu.mergeSettings) {
                    this.rightmenu.mergeSettings.disableControls(disabled);
                    disabled && this.rightmenu.btnMailMerge.setDisabled(disabled);
                }
                this.rightmenu.chartSettings.disableControls(disabled);

                if (!allowSignature && this.rightmenu.signatureSettings) {
                    this.rightmenu.btnSignature.setDisabled(disabled);
                }

                if (disabled) {
                    this.rightmenu.btnText.setDisabled(disabled);
                    this.rightmenu.btnTable.setDisabled(disabled);
                    this.rightmenu.btnImage.setDisabled(disabled);
                    this.rightmenu.btnHeaderFooter.setDisabled(disabled);
                    this.rightmenu.btnShape.setDisabled(disabled);
                    this.rightmenu.btnTextArt.setDisabled(disabled);
                    this.rightmenu.btnChart.setDisabled(disabled);
                } else {
                    var selectedElements = this.api.getSelectedElements();
                    if (selectedElements.length > 0)
                        this.onFocusObject(selectedElements);
                }
            }
        },

        getDocumentSettingsType: function(type) {
            switch (type) {
                case Asc.c_oAscTypeSelectElement.Paragraph:
                    return Common.Utils.documentSettingsType.Paragraph;
                case Asc.c_oAscTypeSelectElement.Table:
                    return Common.Utils.documentSettingsType.Table;
                case Asc.c_oAscTypeSelectElement.Image:
                    return Common.Utils.documentSettingsType.Image;
                case Asc.c_oAscTypeSelectElement.Header:
                    return Common.Utils.documentSettingsType.Header;
            }
        }
    });
});