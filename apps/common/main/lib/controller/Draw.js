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
 *  Draw.js
 *
 *  Created on 28.03.2023
 *
 */

if (Common === undefined)
    var Common = {};
Common.Controllers = Common.Controllers || {};

define([
    'core',
    'common/main/lib/view/Draw'
], function () {
    'use strict';

    Common.Controllers.Draw = Backbone.Controller.extend(_.extend({
        models : [],
        collections : [
        ],
        views : [
            'Common.Views.Draw'
        ],
        sdkViewName : '#id_main',

        initialize: function () {

            this.addListeners({
                'Common.Views.Draw': {
                    'draw:select':      _.bind(this.onSelect, this),
                    'draw:eraser':      _.bind(this.onEraser, this),
                    'draw:pen':     _.bind(this.onDrawPen, this),
                    'draw:size':     _.bind(this.onDrawSizeClick, this),
                    'draw:color':     _.bind(this.onDrawColorClick, this)
                }
            });
        },
        onLaunch: function () {
            this._state = {};

            Common.NotificationCenter.on({
                'draw-tool:pen': this.startDraw.bind(this),
                'draw-tool:eraser': this.startEraser.bind(this),
                'draw-tool:select': this.stopDraw.bind(this),
                'draw-tool:erase-all': this.onEraseAllInksOnSlide.bind(this),
                'app:ready': this.onAppReady.bind(this),
                'api:disconnect': _.bind(this.onCoAuthoringDisconnect, this)
            });
        },

        setConfig: function (data, api) {
            this.setApi(api);

            if (data) {
                this.sdkViewName        =   data['sdkviewname'] || this.sdkViewName;
            }
        },
        setApi: function (api) {
            if (api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onInkDrawerStop',_.bind(this.onInkDrawerStop, this));
                this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',_.bind(this.onCoAuthoringDisconnect, this));
            }
            return this;
        },

        setMode: function(mode) {
            this.appConfig = mode;

            if (mode.isEdit)
                this.view = this.createView('Common.Views.Draw', {
                    mode: mode
                });

            return this;
        },

        SetDisabled: function(state) {
            this.view && this.view.SetDisabled(state);
        },

        onInkDrawerStop: function() {
            this.view && this.view.depressButtons();
            Common.NotificationCenter.trigger('draw:stop', this.view);
        },

        onSelect: function(btn){
            this.api && this.api.asc_StopInkDrawer();
            Common.NotificationCenter.trigger('edit:complete', this.view);
        },

        startEraser: function() {
            this.api && this.api.asc_StartInkEraser();
            Common.NotificationCenter.trigger('draw:start', this.view);
        },

        onEraser: function(btn){
            if (this.api) {
                if (!btn.pressed)
                    this.api.asc_StopInkDrawer();
                else {
                    this.view.depressButtons(btn);
                    this.startEraser();
                }
            }
        },

        onEraseAllInksOnSlide: function() {
            this.api && this.api.asc_EraseAllInksOnSlide();
        },

        startDraw: function(options) {
            if (!this.api) { return; }
            var stroke = new Asc.asc_CStroke();
            stroke.put_type( Asc.c_oAscStrokeType.STROKE_COLOR);
            stroke.put_color(Common.Utils.ThemeColor.getRgbColor(options.color));
            stroke.asc_putPrstDash(Asc.c_oDashType.solid);
            stroke.put_width(options.size);
            stroke.put_transparent(options.opacity * 2.55);
            this.api.asc_StartDrawInk(stroke, options.index);
            Common.NotificationCenter.trigger('draw:start', this.view);
        },

        stopDraw: function() {
            this.api && this.api.asc_StopInkDrawer();
            Common.NotificationCenter.trigger('draw:stop', this.view);
        },

        onDrawPen: function(btn){
            if (this.api) {
                if (!btn.pressed)
                    this.api.asc_StopInkDrawer();
                else {
                    this.view.depressButtons(btn);
                    var options = _.clone(btn.options.penOptions);
                    options.size = options.size.arr[options.size.idx];
                    options.index = options.idx;
                    this.startDraw(options);
                }
            }
        },

        onDrawSizeClick: function(btn, direction){
            if (!btn.pressed) {
                btn.toggle(true, true);
                this.view && this.view.depressButtons(btn);
            }

            var options = btn.options.penOptions;
            options.size.idx =  (direction==='up') ? Math.min(options.size.idx+1, options.size.arr.length-1) : Math.max(options.size.idx-1, 0);
            this.view && this.view.updateButtonHint(btn);

            this.onDrawPen(btn);
        },

        onDrawColorClick: function(btn, color){
            if (!btn.pressed) {
                btn.toggle(true, true);
                this.view && this.view.depressButtons(btn);
            }

            btn.options.penOptions.color = color;
            this.view && this.view.updateButtonHint(btn);

            this.onDrawPen(btn);
        },

        createToolbarPanel: function(groups) {
            return this.view ? this.view.getPanel(groups) : null;
        },

        getView: function(name) {
            return !name && this.view ?
                this.view : Backbone.Controller.prototype.getView.call(this, name);
        },

        onAppReady: function (config) {
            var me = this;
            (new Promise(function (accept, reject) {
                accept();
            })).then(function(){
            });
        },

        onCoAuthoringDisconnect: function() {
            this.SetDisabled(true);
        }

    }, Common.Controllers.Draw || {}));
});