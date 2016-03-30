/**
 *  RightMenu.js
 *
 *  Created by Julia Radzhabova on 4/10/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
            this._settings[Common.Utils.documentSettingsType.Slide] =    {panelId: "id-slide-settings",       panel: rightMenu.slideSettings,    btn: rightMenu.btnSlide,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Shape] =     {panelId: "id-shape-settings",      panel: rightMenu.shapeSettings,    btn: rightMenu.btnShape,       hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.TextArt] =   {panelId: "id-textart-settings",    panel: rightMenu.textartSettings,  btn: rightMenu.btnTextArt,     hidden: 1, locked: false};
            this._settings[Common.Utils.documentSettingsType.Chart] = {panelId: "id-chart-settings",          panel: rightMenu.chartSettings,    btn: rightMenu.btnChart,       hidden: 1, locked: false};
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onCountPages',           _.bind(this.onApiCountPages, this));
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
                    panel.ChangeSettings.call(panel, props);
            }
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            this.rightmenu.fireEvent('editcomplete', this.rightmenu);
        },

        onFocusObject: function(SelectedObjects, open) {
            if (!this.editMode)
                return;

            var needhide = true;
            for (var i=0; i<this._settings.length; i++) {
                if (this._settings[i]) {
                    this._settings[i].hidden = 1;
                    this._settings[i].locked = undefined;
                }
            }
            this._settings[Common.Utils.documentSettingsType.Slide].hidden = 0;

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
                    this._settings[settingsType].lockedEffects = value.get_LockTranzition();
                    this._settings[settingsType].lockedTiming = value.get_LockTiming();
                } else {
                    this._settings[settingsType].locked = value.get_Locked();
                    if (settingsType == Common.Utils.documentSettingsType.Shape && value.asc_getTextArtProperties()) {
                        this._settings[Common.Utils.documentSettingsType.TextArt].props = value;
                        this._settings[Common.Utils.documentSettingsType.TextArt].hidden = 0;
                        this._settings[Common.Utils.documentSettingsType.TextArt].locked = value.get_Locked();
                    }
                }
            }

            if ( this._settings[Common.Utils.documentSettingsType.Slide].locked ) { // если находимся в locked slide, то считаем, что все элементы в нем тоже недоступны
                for (i=0; i<this._settings.length; i++)  {
                    if (this._settings[i])
                        this._settings[i].locked = true;
                }
            }

            var lastactive = -1, currentactive, priorityactive = -1;
            for (i=0; i<this._settings.length; i++) {
                var pnl = this._settings[i];
                if (pnl===undefined) continue;

                if ( pnl.hidden ) {
                    if (!pnl.btn.isDisabled()) pnl.btn.setDisabled(true);
                    if (this.rightmenu.GetActivePane() == pnl.panelId)
                        currentactive = -1;
                } else {
                    if (pnl.btn.isDisabled()) pnl.btn.setDisabled(false);
                    if ( i!=Common.Utils.documentSettingsType.Slide )
                        lastactive = i;
                    if ( pnl.needShow ) {
                        pnl.needShow = false;
                        priorityactive = i;
                    } else if ( i != Common.Utils.documentSettingsType.Slide || this.rightmenu._settings[i].isCurrent) {
                        if (this.rightmenu.GetActivePane() == pnl.panelId)
                            currentactive = i;
                    }

                    if (i == Common.Utils.documentSettingsType.Slide) {
                        if (pnl.locked!==undefined)
                            this.rightmenu.slideSettings.SetSlideDisabled(this._state.no_slides || pnl.lockedBackground || pnl.locked,
                                                                          this._state.no_slides || pnl.lockedEffects || pnl.locked,
                                                                          this._state.no_slides || pnl.lockedTiming || pnl.locked);
                    } else
                        pnl.panel.setLocked(pnl.locked);
                }
            }

            if (!this.rightmenu.minimizedMode || open) {
                var active;

                if (priorityactive>-1) active = priorityactive;
                else if (currentactive>=0) active = currentactive;
                else if (lastactive>=0) active = lastactive;
                else active = Common.Utils.documentSettingsType.Slide;

                if (active !== undefined) {
                    this.rightmenu.SetActivePane(active, open);
                    this._settings[active].panel.ChangeSettings.call(this._settings[active].panel, this._settings[active].props);
                }
            }

            this._settings[Common.Utils.documentSettingsType.Image].needShow = false;
            this._settings[Common.Utils.documentSettingsType.Chart].needShow = false;
            this._settings[Common.Utils.documentSettingsType.Shape].needShow = false;
        },

        onCoAuthoringDisconnect: function() {
            if (this.rightmenu)
                this.rightmenu.SetDisabled('', true, true);
            this.setMode({isEdit: false});
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
            this.rightmenu.slideSettings.UpdateThemeColors();
            this.rightmenu.tableSettings.UpdateThemeColors();
            this.rightmenu.shapeSettings.UpdateThemeColors();
            this.rightmenu.textartSettings.UpdateThemeColors();
        },

        updateMetricUnit: function() {
            this.rightmenu.paragraphSettings.updateMetricUnit();
            this.rightmenu.chartSettings.updateMetricUnit();
            this.rightmenu.imageSettings.updateMetricUnit();
        },

        fillTextArt:  function() {
            this.rightmenu.textartSettings.fillTextArt();
        },

        createDelayedElements: function() {
            if (this.editMode && this.api) {
                this.api.asc_registerCallback('asc_doubleClickOnObject', _.bind(this.onDoubleClickOnObject, this));

                var selectedElements = this.api.getSelectedElements();
                if (selectedElements.length>0) {
                    var open = Common.localStorage.getItem("pe-hide-right-settings");
                    open = (open===null || parseInt(open) == 0);
                    
                    this.onFocusObject(selectedElements, open);
                }
            }
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
            }
        },

        onApiCountPages: function(count) {
            if (this._state.no_slides !== (count<=0) && this.editMode) {
                this._state.no_slides = (count<=0);
                if ( this._state.no_slides && !this.rightmenu.minimizedMode)
                    this.rightmenu.clearSelection();
                this._settings[Common.Utils.documentSettingsType.Slide].btn.setDisabled(this._state.no_slides);
            }
        },

        getDocumentSettingsType: function(type) {
            switch (type) {
                case c_oAscTypeSelectElement.Paragraph:
                    return Common.Utils.documentSettingsType.Paragraph;
                case c_oAscTypeSelectElement.Table:
                    return Common.Utils.documentSettingsType.Table;
                case c_oAscTypeSelectElement.Image:
                    return Common.Utils.documentSettingsType.Image;
                case c_oAscTypeSelectElement.Shape:
                    return Common.Utils.documentSettingsType.Shape;
                case c_oAscTypeSelectElement.Slide:
                    return Common.Utils.documentSettingsType.Slide;
                case c_oAscTypeSelectElement.Chart:
                    return Common.Utils.documentSettingsType.Chart;
            }
        }
    });
});