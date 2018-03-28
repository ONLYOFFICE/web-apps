/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  DocumentPreview.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/22/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'presentationeditor/mobile/app/view/DocumentPreview'
], function (core, $, _, Backbone) {
    'use strict';

    PE.Controllers.DocumentPreview = Backbone.Controller.extend(_.extend((function() {
        // private
        var _view,
            _touches,
            _touchStart,
            _touchEnd;

        return {
            models: [],
            collections: [],
            views: [
                'DocumentPreview'
            ],

            initialize: function() {
            },

            setApi: function(api) {
                var me = this;

                me.api = api;
                me.api.asc_registerCallback('asc_onEndDemonstration',  _.bind(me.onEndDemonstration, me));
            },

            // When our application is ready, lets get started
            onLaunch: function() {
                var me = this;
                _view = me.createView('DocumentPreview').render();

                $$('#pe-preview').on('touchstart', _.bind(me.onTouchStart, me))
                                .on('touchmove',   _.bind(me.onTouchMove, me))
                                .on('touchend',    _.bind(me.onTouchEnd, me))
                                .on('click',       _.bind(me.onClick, me));
            },

            // Handlers

            show: function() {
                _view.$el.css('display', 'block');
                $('.view.view-main').css('z-index','0');

                PE.getController('DocumentHolder').stopApiPopMenu();

                this.api.StartDemonstration('presentation-preview', this.api.getCurrentPage());
            },

            onTouchStart: function(event) {
                event.preventDefault();

                _touches = [];
                for (var i=0; i<event.touches.length; i++) {
                    _touches.push([event.touches[i].pageX, event.touches[i].pageY]);
                }
                _touchEnd = _touchStart = [event.touches[0].pageX, event.touches[0].pageY];
            },

            onTouchMove: function(event) {
                event.preventDefault();

                _touchEnd = [event.touches[0].pageX, event.touches[0].pageY];

                if (event.touches.length<2) return;

                for (var i=0; i<event.touches.length; i++) {
                    if (Math.abs(event.touches[i].pageX - _touches[i][0]) > 20 || Math.abs(event.touches[i].pageY - _touches[i][1]) > 20 ) {
                        this.api.EndDemonstration();
                        break;
                    }
                }
            },

            onTouchEnd: function(event) {
                event.preventDefault();

                if (_touchEnd[0] - _touchStart[0] > 20)
                    this.api.DemonstrationPrevSlide();
                else if (_touchStart[0] - _touchEnd[0] > 20)
                    this.api.DemonstrationNextSlide();
            },

            onClick: function(event) {
                this.api.DemonstrationNextSlide();
            },

            // API Handlers

            onEndDemonstration: function() {
                _view.$el.css('display', 'none');
                $('.view.view-main').css('z-index','auto');

                PE.getController('DocumentHolder').startApiPopMenu();
            }

            // Internal
        }
    })(), PE.Controllers.DocumentPreview || {}))
});