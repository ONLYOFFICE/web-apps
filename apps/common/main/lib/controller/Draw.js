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

            Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            Common.NotificationCenter.on('api:disconnect', _.bind(this.onCoAuthoringDisconnect, this));
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

        onEraser: function(btn){
            if (this.api) {
                if (!btn.pressed)
                    this.api.asc_StopInkDrawer();
                else {
                    this.view.depressButtons(btn);
                    this.api.asc_StartInkEraser();
                    Common.NotificationCenter.trigger('draw:start', this.view);
                }
            }
        },

        onDrawPen: function(btn){
            if (this.api) {
                if (!btn.pressed)
                    this.api.asc_StopInkDrawer();
                else {
                    this.view.depressButtons(btn);

                    var options = btn.options.penOptions;
                    var stroke = new Asc.asc_CStroke();
                    stroke.put_type( Asc.c_oAscStrokeType.STROKE_COLOR);
                    stroke.put_color(Common.Utils.ThemeColor.getRgbColor(options.color));
                    stroke.asc_putPrstDash(Asc.c_oDashType.solid);
                    stroke.put_width(options.size.arr[options.size.idx]);
                    stroke.put_transparent(options.opacity * 2.55);
                    this.api.asc_StartDrawInk(stroke, options.idx);
                    Common.NotificationCenter.trigger('draw:start', this.view);
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
            return this.view.getPanel(groups);
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