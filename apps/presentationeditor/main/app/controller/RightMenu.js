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
 *  RightMenu.js
 *
 *  Created on 4/10/14
 *
 */


define([
    'core',
    'presentationeditor/main/app/view/RightMenu'
], function () {
    'use strict';

    PE.Controllers.RightMenu = Backbone.Controller.extend({
        models: [],
        collections: [],
        views: [
            'RightMenu'
        ],

        initialize: function() {
            this.editMode = true;
            this._state = {no_slides: undefined};
            this._initSettings = true;
            this._priorityArr = [];

            this.addListeners({
                'RightMenu': {
                    'rightmenuclick': this.onRightMenuClick,
                    'button:click':  _.bind(this.onBtnCategoryClick, this)
                },
                'ViewTab': {
                    'rightmenu:hide': _.bind(this.onRightMenuHide, this),
                    'viewmode:change': _.bind(this.onChangeViewMode, this)
                },
                'Common.Views.Plugins': {
                    'plugins:addtoright': _.bind(this.addNewPlugin, this),
                    'pluginsright:open': _.bind(this.openPlugin, this),
                    'pluginsright:close': _.bind(this.closePlugin, this),
                    'pluginsright:hide': _.bind(this.onHidePlugins, this),
                    'pluginsright:updateicons': _.bind(this.updatePluginButtonsIcons, this)
                }
            });
        },

        onLaunch: function() {
            this.rightmenu = this.createView('RightMenu');
            this.rightmenu.on('render:after', _.bind(this.onRightMenuAfterRender, this));
        },

        onRightMenuAfterRender: function(rightMenu) {
            rightMenu.imageSettings.application = rightMenu.shapeSettings.application = rightMenu.textartSettings.application = this.getApplication();

            this._settings = [];
            this._settings[Common.Utils.documentSettingsType.Paragraph] = {panelId: "id-paragraph-settings",  panel: rightMenu.paragraphSettings,btn: rightMenu.btnText,        hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Table] =     {panelId: "id-table-settings",      panel: rightMenu.tableSettings,    btn: rightMenu.btnTable,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Image] =     {panelId: "id-image-settings",      panel: rightMenu.imageSettings,    btn: rightMenu.btnImage,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Slide] =    {panelId: "id-slide-settings",       panel: rightMenu.slideSettings,    btn: rightMenu.btnSlide,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Shape] =     {panelId: "id-shape-settings",      panel: rightMenu.shapeSettings,    btn: rightMenu.btnShape,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.TextArt] =   {panelId: "id-textart-settings",    panel: rightMenu.textartSettings,  btn: rightMenu.btnTextArt,     hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Chart] = {panelId: "id-chart-settings",          panel: rightMenu.chartSettings,    btn: rightMenu.btnChart,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Signature] = {panelId: "id-signature-settings",  panel: rightMenu.signatureSettings, btn: rightMenu.btnSignature,  hidden: 1, props: {}, locked: false};
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onUpdateSignatures',     _.bind(this.onApiUpdateSignatures, this));
            this.api.asc_registerCallback('asc_onCountPages',           _.bind(this.onApiCountPages, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            Common.NotificationCenter.on('api:disconnect',              _.bind(this.onCoAuthoringDisconnect, this));
        },

        setMode: function(mode) {
            this.editMode = mode.isEdit;
        },

        onRightMenuClick: function(menu, type, minimized, event) {
            if (!minimized && this.editMode) {
                if (event) { // user click event
                    var idx = this._priorityArr.indexOf(type);
                    if (idx>=0)
                        this._priorityArr.splice(idx, 1);
                    this._priorityArr.unshift(type);
                }

                var panel = this._settings[type].panel;
                var props = this._settings[type].props;
                if (props && panel) {
                    panel.ChangeSettings.call(panel, (type==Common.Utils.documentSettingsType.Signature) ? undefined : props);
                    this.rightmenu.updateScroller();
                }
            }
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            this.rightmenu.fireEvent('editcomplete', this.rightmenu);
        },

        onFocusObject: function(SelectedObjects, forceSignature, forceOpen) {
            if (!this.editMode && !forceSignature)
                return;

            var open = this._initSettings ? !Common.localStorage.getBool("pe-hide-right-settings", this.rightmenu.defaultHideRightMenu) : !!forceOpen;
            this._initSettings = false;

            var needhide = true;
            for (var i=0; i<this._settings.length; i++) {
                if (i==Common.Utils.documentSettingsType.Signature) continue;
                if (this._settings[i]) {
                    this._settings[i].hidden = 1;
                    this._settings[i].locked = undefined;
                }
            }
            this._settings[Common.Utils.documentSettingsType.Slide].hidden = (SelectedObjects.length>0) ? 0 : 1;
            this._settings[Common.Utils.documentSettingsType.Signature].locked = false;

            for (i=0; i<SelectedObjects.length; i++)
            {
                var eltype = SelectedObjects[i].get_ObjectType(),
                    settingsType = this.getDocumentSettingsType(eltype);
                if (settingsType===undefined || settingsType>=this._settings.length || this._settings[settingsType]===undefined)
                    continue;

                var value = SelectedObjects[i].get_ObjectValue();
                this._settings[settingsType].props = value;
                this._settings[settingsType].hidden = 0;
                if (settingsType==Common.Utils.documentSettingsType.Slide) {
                    this._settings[settingsType].locked = value.get_LockDelete();
                    this._settings[settingsType].lockedBackground = value.get_LockBackground();
                    /*this._settings[settingsType].lockedEffects = value.get_LockTransition();
                    this._settings[settingsType].lockedTransition = value.get_LockTransition();*/
                    this._settings[settingsType].inMaster = value.get_IsMasterSelected();
                } else {
                    this._settings[settingsType].locked = value.get_Locked();
                    if (settingsType == Common.Utils.documentSettingsType.Shape) {
                        if (value.asc_getIsMotionPath()) {
                            this._settings[settingsType].hidden = 1;
                        } else if (value.asc_getTextArtProperties()) {
                            this._settings[Common.Utils.documentSettingsType.TextArt].props = value;
                            this._settings[Common.Utils.documentSettingsType.TextArt].hidden = 0;
                            this._settings[Common.Utils.documentSettingsType.TextArt].locked = value.get_Locked();
                        }
                    }
                }
            }

            if ( this._settings[Common.Utils.documentSettingsType.Slide].locked ) { // если находимся в locked slide, то считаем, что все элементы в нем тоже недоступны
                for (i=0; i<this._settings.length; i++)  {
                    if (this._settings[i])
                        this._settings[i].locked = true;
                }
            }

            var lastactive = -1, currentactive, priorityactive = -1,
                activePane = this.rightmenu.GetActivePane();
            for (i=0; i<this._settings.length; i++) {
                var pnl = this._settings[i];
                if (pnl===undefined || pnl.btn===undefined || pnl.panel===undefined) continue;

                if ( pnl.hidden ) {
                    if (!pnl.btn.isDisabled()) {
                        pnl.btn.setDisabled(true);
                        this.rightmenu.setDisabledMoreMenuItem(pnl.btn, true);
                    }
                    if (activePane == pnl.panelId)
                        currentactive = -1;
                } else {
                    if (pnl.btn.isDisabled()) {
                        pnl.btn.setDisabled(false);
                        this.rightmenu.setDisabledMoreMenuItem(pnl.btn, false);
                    }
                    if ( i!=Common.Utils.documentSettingsType.Slide && i!=Common.Utils.documentSettingsType.Signature)
                        lastactive = i;
                    if ( pnl.needShow ) {
                        pnl.needShow = false;
                        priorityactive = i;
                    } else if ( i != Common.Utils.documentSettingsType.Slide || this.rightmenu._settings[i].isCurrent) {
                        if (activePane == pnl.panelId)
                            currentactive = i;
                    }

                    if (i == Common.Utils.documentSettingsType.Slide) {
                        if (pnl.locked!==undefined)
                            this.rightmenu.slideSettings.setLocked(this._state.no_slides || pnl.lockedBackground || pnl.locked,
                                                                          this._state.no_slides || pnl.lockedHeader || pnl.locked, pnl.inMaster);
                    } else
                        pnl.panel.setLocked(pnl.locked);
                }
            }

            if (!this.rightmenu.minimizedMode || open) {
                var active;

                if (priorityactive<0) {
                    if (this._priorityArr.length>0) {
                        for (i=0; i<this._priorityArr.length; i++) {
                            var type = this._priorityArr[i],
                                pnl = this._settings[type];
                            if (pnl===undefined || pnl.btn===undefined || pnl.panel===undefined || pnl.hidden) continue;
                            priorityactive = type;
                            break;
                        }
                    } else if (this._lastVisibleSettings!==undefined) {
                        var pnl = this._settings[this._lastVisibleSettings];
                        if (pnl!==undefined && pnl.btn!==undefined && pnl.panel!==undefined && !pnl.hidden)
                            priorityactive = this._lastVisibleSettings;
                    }
                }

                if (priorityactive>-1) active = priorityactive;
                else if (currentactive>=0) active = currentactive;
                else if (lastactive>=0) active = lastactive;
                else if (forceSignature && !this._settings[Common.Utils.documentSettingsType.Signature].hidden) active = Common.Utils.documentSettingsType.Signature;
                else active = Common.Utils.documentSettingsType.Slide;

                if (active !== undefined) {
                    this.rightmenu.SetActivePane(active, open);
                    if (active!=Common.Utils.documentSettingsType.Signature)
                        this._settings[active].panel.ChangeSettings.call(this._settings[active].panel, this._settings[active].props);
                    else
                        this._settings[active].panel.ChangeSettings.call(this._settings[active].panel);
                    (active !== currentactive) && this.rightmenu.updateScroller();
                }
            }

            this._settings[Common.Utils.documentSettingsType.Image].needShow = false;
            this._settings[Common.Utils.documentSettingsType.Chart].needShow = false;
            this._settings[Common.Utils.documentSettingsType.Shape].needShow = false;
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
            this.setMode({isEdit: false});
        },

        SetDisabled: function(disabled, allowSignature) {
            this.setMode({isEdit: !disabled});
            if (this.rightmenu && this.rightmenu.paragraphSettings) {
                this.rightmenu.slideSettings.SetSlideDisabled(disabled, disabled);
                this.rightmenu.paragraphSettings.disableControls(disabled);
                this.rightmenu.shapeSettings.disableControls(disabled);
                this.rightmenu.textartSettings.disableControls(disabled);
                this.rightmenu.tableSettings.disableControls(disabled);
                this.rightmenu.imageSettings.disableControls(disabled);
                this.rightmenu.chartSettings.disableControls(disabled);

                if (this.rightmenu.signatureSettings) {
                    !allowSignature && this.rightmenu.btnSignature.setDisabled(disabled);
                    allowSignature && disabled && this.onFocusObject([], true); // force press signature button
                }

                if (disabled) {
                    this.rightmenu.btnSlide.setDisabled(disabled);
                    this.rightmenu.btnText.setDisabled(disabled);
                    this.rightmenu.btnTable.setDisabled(disabled);
                    this.rightmenu.btnImage.setDisabled(disabled);
                    this.rightmenu.btnShape.setDisabled(disabled);
                    this.rightmenu.btnTextArt.setDisabled(disabled);
                    this.rightmenu.btnChart.setDisabled(disabled);
                    this.rightmenu.setDisabledAllMoreMenuItems(disabled);
                } else {
                    var selectedElements = this.api.getSelectedElements();
                    if (selectedElements.length > 0)
                        this.onFocusObject(selectedElements, false, !Common.Utils.InternalSettings.get("pe-hide-right-settings") &&
                                                                                 !Common.Utils.InternalSettings.get("pe-hidden-rightmenu"));
                }
            }
        },

        onInsertTable:  function() {
            // this._settings[Common.Utils.documentSettingsType.Table].needShow = true;
            var idx = this._priorityArr.indexOf(Common.Utils.documentSettingsType.Table);
            if (idx>=0)
                this._priorityArr.splice(idx, 1);
            this._priorityArr.unshift(Common.Utils.documentSettingsType.Table);
        },

        onInsertImage:  function() {
            // this._settings[Common.Utils.documentSettingsType.Image].needShow = true;
            var idx = this._priorityArr.indexOf(Common.Utils.documentSettingsType.Image);
            if (idx>=0)
                this._priorityArr.splice(idx, 1);
            this._priorityArr.unshift(Common.Utils.documentSettingsType.Image);
        },

        onInsertChart:  function() {
            // this._settings[Common.Utils.documentSettingsType.Chart].needShow = true;
            var idx = this._priorityArr.indexOf(Common.Utils.documentSettingsType.Chart);
            if (idx>=0)
                this._priorityArr.splice(idx, 1);
            this._priorityArr.unshift(Common.Utils.documentSettingsType.Chart);
        },

        onInsertShape:  function() {
            // this._settings[Common.Utils.documentSettingsType.Shape].needShow = true;
            var idx = this._priorityArr.indexOf(Common.Utils.documentSettingsType.Shape);
            if (idx>=0)
                this._priorityArr.splice(idx, 1);
            this._priorityArr.unshift(Common.Utils.documentSettingsType.Shape);
        },

        onInsertTextArt:  function() {
            // this._settings[Common.Utils.documentSettingsType.TextArt].needShow = true;
            var idx = this._priorityArr.indexOf(Common.Utils.documentSettingsType.TextArt);
            if (idx>=0)
                this._priorityArr.splice(idx, 1);
            this._priorityArr.unshift(Common.Utils.documentSettingsType.TextArt);
        },

        UpdateThemeColors:  function() {
            this.rightmenu.slideSettings.UpdateThemeColors();
            this.rightmenu.tableSettings.UpdateThemeColors();
            this.rightmenu.shapeSettings.UpdateThemeColors();
            this.rightmenu.textartSettings.UpdateThemeColors();
        },

        updateMetricUnit: function() {
            this.rightmenu.paragraphSettings.updateMetricUnit();
            this.rightmenu.chartSettings.updateMetricUnit();
            this.rightmenu.imageSettings.updateMetricUnit();
            this.rightmenu.tableSettings.updateMetricUnit();
        },

        createDelayedElements: function() {
            if (this.editMode && this.api) {
                this.api.asc_registerCallback('asc_doubleClickOnObject', _.bind(this.onDoubleClickOnObject, this));

                // this.rightmenu.shapeSettings.createDelayedElements();
                var selectedElements = this.api.getSelectedElements();
                if (selectedElements.length>0) {
                    this.onFocusObject(selectedElements);
                }
            }
            this.rightmenu.setButtons();
            this.rightmenu.setMoreButton();
        },

        onDoubleClickOnObject: function(obj) {
            if (!this.editMode) return;

            var eltype = obj.get_ObjectType(),
                settingsType = this.getDocumentSettingsType(eltype);
            if (settingsType===undefined || settingsType>=this._settings.length || this._settings[settingsType]===undefined)
                return;

            if (settingsType !== Common.Utils.documentSettingsType.Paragraph) {
                this.rightmenu.SetActivePane(settingsType, true);
                this._settings[settingsType].panel.ChangeSettings.call(this._settings[settingsType].panel, this._settings[settingsType].props);
                this.rightmenu.updateScroller();
            }
        },

        onApiUpdateSignatures: function(valid){
            if (!this.rightmenu.signatureSettings) return;

            var disabled = (!valid || valid.length<1),
                type = Common.Utils.documentSettingsType.Signature;
            this._settings[type].hidden = disabled ? 1 : 0;
            this._settings[type].btn.setDisabled(disabled);
            this.rightmenu.setDisabledMoreMenuItem(this._settings[type].btn, disabled);
            this._settings[type].panel.setLocked(this._settings[type].locked);
        },

        onApiCountPages: function(count) {
            if (this._state.no_slides !== (count<=0) && this.editMode) {
                this._state.no_slides = (count<=0);
                if ( this._state.no_slides && !this.rightmenu.minimizedMode)
                    this.rightmenu.clearSelection();
                this._settings[Common.Utils.documentSettingsType.Slide].btn.setDisabled(this._state.no_slides);
                this.rightmenu.setDisabledMoreMenuItem(this._settings[Common.Utils.documentSettingsType.Slide].btn, this._state.no_slides);
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
                case Asc.c_oAscTypeSelectElement.Shape:
                    return Common.Utils.documentSettingsType.Shape;
                case Asc.c_oAscTypeSelectElement.Slide:
                    return Common.Utils.documentSettingsType.Slide;
                case Asc.c_oAscTypeSelectElement.Chart:
                    return Common.Utils.documentSettingsType.Chart;
            }
        },

        onRightMenuHide: function (view, status) {
            if (this.rightmenu) {
                if (!status)  { // remember last active pane
                    var active = this.rightmenu.GetActivePane(),
                        type;
                    if (active) {
                        for (var i=0; i<this._settings.length; i++) {
                            if (this._settings[i] && this._settings[i].panelId === active) {
                                type = i;
                                break;
                            }
                        }
                        this._lastVisibleSettings = type;
                    }
                    this.rightmenu.clearSelection();
                    this.rightmenu.hide();
                    this.rightmenu.signatureSettings && this.rightmenu.signatureSettings.hideSignatureTooltip();
                } else {
                    this.rightmenu.show();
                    var selectedElements = this.api.getSelectedElements();
                    if (selectedElements.length > 0)
                        this.onFocusObject(selectedElements, false, !Common.Utils.InternalSettings.get("pe-hide-right-settings"));
                    this._lastVisibleSettings = undefined;
                }
                !view && this.rightmenu.fireEvent('view:hide', [this, !status]);
                Common.localStorage.setBool('pe-hidden-rightmenu', !status);
                Common.Utils.InternalSettings.set("pe-hidden-rightmenu", !status);
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

        onChangeViewMode: function (mode) {
            if (this.rightmenu && this.rightmenu.slideSettings)
                this.rightmenu.slideSettings.setSlideMasterMode(mode==='master');
        }
    });
});