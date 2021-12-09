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
 *  ViewTab.js
 *
 *  Created by Julia Svinareva on 07.12.2021
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/main/app/view/ViewTab'
], function () {
    'use strict';

    PE.Controllers.ViewTab = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'ViewTab'
        ],
        sdkViewName : '#id_main',

        initialize: function () {
        },
        onLaunch: function () {
            this._state = {
                zoom_type: undefined,
                zoom_percent: undefined
            };
            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
        },

        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onZoomChange', _.bind(this.onZoomChange, this));
            }
            return this;
        },

        setConfig: function(config) {
            this.toolbar = config.toolbar;
            this.view = this.createView('ViewTab', {
                toolbar: this.toolbar.toolbar,
                mode: config.mode
            });
            this.addListeners({
                'ViewTab': {
                    'zoom:value': _.bind(this.onChangeZoomValue, this),
                    'zoom:toslide': _.bind(this.onBtnZoomTo, this, 'toslide'),
                    'zoom:towidth': _.bind(this.onBtnZoomTo, this, 'towidth')
                },
                'Statusbar': {

                }
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

        onZoomChange: function (percent, type) {
            if (this._state.zoom_type !== type) {
                this.view.btnFitToSlide.toggle(type == 2, true);
                this.view.btnFitToWidth.toggle(type == 1, true);
                this._state.zoom_type = type;
            }
            if (this._state.zoom_percent !== percent) {
                this.view.cmbZoom.setValue(percent, percent + '%');
                this._state.zoom_percent = percent;
            }
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
                me.view.setEvents();
            });
        },

        onChangeZoomValue: function (value) {
            this._state.zoom_type = undefined;
            this._state.zoom_percent = undefined;
            this.api.zoom(value);
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        onBtnZoomTo: function (type, btn) {
            this._state.zoom_type = undefined;
            this._state.zoom_percent = undefined;
            if (!btn.pressed)
                this.api.zoomCustomMode();
            else
                this.api[type === 'toslide' ? 'zoomFitToPage' : 'zoomFitToWidth']();
            Common.NotificationCenter.trigger('edit:complete', this.view);
        }

    }, PE.Controllers.ViewTab || {}));
});