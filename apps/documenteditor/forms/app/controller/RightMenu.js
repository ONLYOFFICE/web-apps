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
 *  RightMenu.js
 *
 *  Created on 1/17/14
 *
 */

define([
    'core',
    'documenteditor/forms/app/view/RightMenu'
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
            this._initSettings = true;
            this._state = {
                docProtection: {
                    isReadOnly: false,
                    isReviewOnly: false,
                    isFormsOnly: false,
                    isCommentsOnly: false
                }
            };
            this.addListeners({
                'RightMenu': {
                    'rightmenuclick': this.onRightMenuClick,
                    'button:click':  _.bind(this.onBtnCategoryClick, this)
                },
                'ViewTab': {
                    'rightmenu:hide': _.bind(this.onRightMenuHide, this)
                },
                'Common.Views.Plugins': {
                    'plugins:addtoright': _.bind(this.addNewPlugin, this),
                    'pluginsright:open': _.bind(this.openPlugin, this),
                    'pluginsright:close': _.bind(this.closePlugin, this),
                    'pluginsright:hide': _.bind(this.onHidePlugins, this),
                    'pluginsright:updateicons': _.bind(this.updatePluginButtonsIcons, this)
                }
            });

            Common.Utils.InternalSettings.set("de-rightpanel-active-form", 1);
        },

        onLaunch: function() {
            this.rightmenu = this.createView('RightMenu');

            this.rightmenu.on('render:after', _.bind(this.onRightMenuAfterRender, this));
        },

        onRightMenuAfterRender: function(rightMenu) {
            this._settings = [];
            this._settings[Common.Utils.documentSettingsType.FillingStatus] = {panelId: "id-filling-status-settings",  panel: rightMenu.fillingStatusSettings, btn: rightMenu.btnFillingStatus,  hidden: 1, props: {}, locked: false};
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onUpdateSignatures', _.bind(this.onApiUpdateSignatures, this));
            Common.NotificationCenter.on('protect:doclock', _.bind(this.onChangeProtectDocument, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onCoAuthoringDisconnect, this));
        },

        setMode: function(mode) {
            this.editMode = mode.isEdit;
        },

        onRightMenuClick: function(menu, type, minimized, event) {
            if (!minimized && this.editMode) {
                var panel = this._settings[type].panel;
                var props = this._settings[type].props;
                if (props && panel) {
                    panel.ChangeSettings.call(panel, (type==Common.Utils.documentSettingsType.MailMerge || type==Common.Utils.documentSettingsType.Signature) ? undefined : props);
                    this.rightmenu.updateScroller();
                }
            }
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            this.rightmenu.fireEvent('editcomplete', this.rightmenu);
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

        onInsertControl:  function() {
            if (this._settings[Common.Utils.documentSettingsType.Form])
                this._settings[Common.Utils.documentSettingsType.Form].needShow = true;
        },

        UpdateThemeColors:  function() {
            this.rightmenu.paragraphSettings.UpdateThemeColors();
            this.rightmenu.tableSettings.UpdateThemeColors();
            this.rightmenu.shapeSettings.UpdateThemeColors();
            this.rightmenu.textartSettings.UpdateThemeColors();
            this.rightmenu.formSettings && this.rightmenu.formSettings.UpdateThemeColors();
        },

        updateMetricUnit: function() {
            // this.rightmenu.headerSettings.updateMetricUnit();
            this.rightmenu.paragraphSettings.updateMetricUnit();
            this.rightmenu.chartSettings.updateMetricUnit();
            this.rightmenu.imageSettings.updateMetricUnit();
            this.rightmenu.tableSettings.updateMetricUnit();
            this.rightmenu.formSettings && this.rightmenu.formSettings.updateMetricUnit();
        },

        createDelayedElements: function() {
            var me = this;
            if (this.api) {
                this.api.asc_registerCallback('asc_doubleClickOnObject', _.bind(this.onDoubleClickOnObject, this));
                if (this.rightmenu.mergeSettings) {
                    this.rightmenu.mergeSettings.setDocumentName(this.getApplication().getController('Viewport').getView('Common.Views.Header').getDocumentCaption());
                    this.api.asc_registerCallback('asc_onStartMailMerge',    _.bind(this.onStartMailMerge, this));
                }
                this.api.asc_registerCallback('asc_onError',             _.bind(this.onError, this));
            }
            this.onChangeProtectDocument();
            this.rightmenu.setButtons();
            this.rightmenu.setMoreButton();
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
                this.rightmenu.updateScroller();
            }
        },

        onStartMailMerge: function() {
            var type = Common.Utils.documentSettingsType.MailMerge;
            this._settings[type].hidden = 0;
            this._settings[type].btn.setDisabled(false);
            this.rightmenu.setDisabledMoreMenuItem(this._settings[type].btn, false);
            this.rightmenu.SetActivePane(type, true);
            this._settings[type].panel.setLocked(this._settings[type].locked);
            this._settings[type].panel.ChangeSettings.call(this._settings[type].panel);
            this.rightmenu.updateScroller();
        },

        onError: function(id, level, errData) {
            if (id==Asc.c_oAscError.ID.MailMergeLoadFile) {
                this._settings[Common.Utils.documentSettingsType.MailMerge].hidden = 1;
                this._settings[Common.Utils.documentSettingsType.MailMerge].btn.setDisabled(true);
                this.rightmenu.setDisabledMoreMenuItem(this._settings[Common.Utils.documentSettingsType.MailMerge].btn, true);
            }
        },

        onApiUpdateSignatures: function(valid, requested){
            if (!this.rightmenu.signatureSettings) return;

            var disabled = (!valid || valid.length<1) && (!requested || requested.length<1),
                type = Common.Utils.documentSettingsType.Signature;
            this._settings[type].hidden = disabled ? 1 : 0;
            this._settings[type].btn.setDisabled(disabled);
            this.rightmenu.setDisabledMoreMenuItem(this._settings[type].btn, disabled);
            this._settings[type].panel.setLocked(this._settings[type].locked);
            this._settings[type].panel.setProtected(this._state.docProtection ? this._state.docProtection.isReadOnly || this._state.docProtection.isFormsOnly || this._state.docProtection.isCommentsOnly : false);
        },

        SetDisabled: function(disabled, allowMerge, allowSignature) {
            this.setMode({isEdit: !disabled});
            if (this.rightmenu && this.rightmenu.paragraphSettings) {
                this.rightmenu.paragraphSettings.disableControls(disabled);
                this.rightmenu.shapeSettings.disableControls(disabled);
                this.rightmenu.textartSettings.disableControls(disabled);
                // this.rightmenu.headerSettings.disableControls(disabled);
                this.rightmenu.tableSettings.disableControls(disabled);
                this.rightmenu.imageSettings.disableControls(disabled);
                this.rightmenu.formSettings && this.rightmenu.formSettings.disableControls(disabled);
                if (!allowMerge && this.rightmenu.mergeSettings) {
                    this.rightmenu.mergeSettings.disableControls(disabled);
                    disabled && this.rightmenu.btnMailMerge.setDisabled(disabled);
                }
                this.rightmenu.chartSettings.disableControls(disabled);
                this.rightmenu.fillingStatusSettings && this.rightmenu.fillingStatusSettings.disableControls(disabled);
                this.rightmenu.sendForSigningSettings && this.rightmenu.sendForSigningSettings.disableControls(disabled);

                if (this.rightmenu.signatureSettings) {
                    !allowSignature && this.rightmenu.btnSignature.setDisabled(disabled);
                }

                if (disabled) {
                    this.rightmenu.btnText.setDisabled(disabled);
                    this.rightmenu.btnTable.setDisabled(disabled);
                    this.rightmenu.btnImage.setDisabled(disabled);
                    // this.rightmenu.btnHeaderFooter.setDisabled(disabled);
                    this.rightmenu.btnShape.setDisabled(disabled);
                    this.rightmenu.btnTextArt.setDisabled(disabled);
                    this.rightmenu.btnChart.setDisabled(disabled);
                    this.rightmenu.btnForm && this.rightmenu.btnForm.setDisabled(disabled);
                    this.rightmenu.btnFillingStatus && this.rightmenu.btnFillingStatus.setDisabled(disabled);
                    this.rightmenu.btnSendForSigning && this.rightmenu.btnSendForSigning.setDisabled(disabled);
                    this.rightmenu.setDisabledAllMoreMenuItems(disabled);
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
                // case Asc.c_oAscTypeSelectElement.Header:
                //     return Common.Utils.documentSettingsType.Header;
            }
        },

        onChangeProtectDocument: function(props) {
            if (!props) {
                var docprotect = this.getApplication().getController('DocProtection');
                props = docprotect ? docprotect.getDocProps() : null;
            }
            if (props) {
                this._state.docProtection = props;
            }
        },

        onRightMenuHide: function (view, status, notSaveInStorage) { // status = true when show panel
            if (this.rightmenu) {
                !status && this.rightmenu.clearSelection();
                status ? this.rightmenu.show() : this.rightmenu.hide();
                if(!notSaveInStorage) {
                    Common.localStorage.setBool('de-hidden-rightmenu', !status);
                    Common.Utils.InternalSettings.set("de-hidden-rightmenu", !status);
                }
                if (status) {
                    var selectedElements = this.api.getSelectedElements();
                } else {
                    this.rightmenu.signatureSettings && this.rightmenu.signatureSettings.hideSignatureTooltip();
                }
                !status && Common.NotificationCenter.trigger('forms:close-help', 'key');
                !status && Common.NotificationCenter.trigger('forms:close-help', 'group-key');
                !status && Common.NotificationCenter.trigger('forms:close-help', 'settings');

                !view && this.rightmenu.fireEvent('view:hide', [this, !status]);
            }
            Common.NotificationCenter.trigger('layout:changed', 'main');
            Common.NotificationCenter.trigger('edit:complete', this.rightmenu);
        },

        onRightMenuOpen: function(type) {
            if (this._settings[type]===undefined || this._settings[type].hidden || this._settings[type].btn.isDisabled() || this._settings[type].panelId===this.rightmenu.GetActivePane()) return;

            this.tryToShowRightMenu();
            this.rightmenu.SetActivePane(type, true);
            this._settings[type].panel.ChangeSettings.call(this._settings[type].panel, this._settings[type].props);
            this.rightmenu.updateScroller();
        },

        tryToShowRightMenu: function() {
            if (this.rightmenu && this.rightmenu.mode && (!this.rightmenu.mode.canBrandingExt || !this.rightmenu.mode.customization || this.rightmenu.mode.customization.rightMenu !== false) && Common.UI.LayoutManager.isElementVisible('rightMenu'))
                this.onRightMenuHide(null, true);
        },

        addNewPlugin: function (button, $button, $panel) {
            this.rightmenu.insertButton(button, $button);
            this.rightmenu.insertPanel($panel);
        },

        openPlugin: function (guid) {
            this.rightmenu.openPlugin(guid);
        },

        closePlugin: function (guid) {
            this.rightmenu.closePlugin(guid);
            this.rightmenu.onBtnMenuClick();
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            this.rightmenu.fireEvent('editcomplete', this.rightmenu);
        },

        openSendForSigning: function() {
            const btnSendForSigning = this.rightmenu.btnSendForSigning;
            if(!btnSendForSigning.isActive()) {
                btnSendForSigning.click();
            }
        },

        closeSendForSigning: function() {
            const btnSendForSigning = this.rightmenu.btnSendForSigning;
            if(btnSendForSigning.isActive()) {
                btnSendForSigning.click();
            }
        },

        onHidePlugins: function() {
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
        },

        updatePluginButtonsIcons: function (icons) {
            this.rightmenu.updatePluginButtonsIcons(icons);
        },

        onBtnCategoryClick: function (btn) {
            if (btn.options.type === 'plugin' && !btn.isDisabled()) {
                this.rightmenu.onBtnMenuClick(btn);
                if (btn.pressed) {
                    this.rightmenu.fireEvent('plugins:showpanel', [btn.options.value]); // show plugin panel
                } else {
                    this.rightmenu.fireEvent('plugins:hidepanel', [btn.options.value]);
                }
                Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
                this.rightmenu.fireEvent('editcomplete', this.rightmenu);
            }
        },
    });
});