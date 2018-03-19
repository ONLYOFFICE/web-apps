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
 *  Editor.js
 *
 *  Created by Maxim Kadushkin on 11/15/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/Editor'
], function (core) {
    'use strict';

    SSE.Controllers.Editor = Backbone.Controller.extend((function() {
        // private

        function isPhone() {
            var ua = navigator.userAgent,
                isMobile = /Mobile(\/|\s)/.test(ua);

            return /(iPhone|iPod)/.test(ua) ||
                (!/(Silk)/.test(ua) && (/(Android)/.test(ua) && (/(Android 2)/.test(ua) || isMobile))) ||
                (/(BlackBerry|BB)/.test(ua) && isMobile) ||
                /(Windows Phone)/.test(ua);
        }

        function isTablet() {
            var ua = navigator.userAgent;

            return !isPhone(ua) && (/iPad/.test(ua) || /Android/.test(ua) || /(RIM Tablet OS)/.test(ua) ||
                (/MSIE 10/.test(ua) && /; Touch/.test(ua)));
        }

        return {
            // Specifying a EditorController model
            models: [],

            // Specifying a collection of out EditorView
            collections: [],

            // Specifying application views
            views: [
                'Editor'   // is main application layout
            ],

            // When controller is created let's setup view event listeners
            initialize: function() {
                // This most important part when we will tell our controller what events should be handled
            },

            setApi: function(api) {
                this.api = api;
            },

            // When our application is ready, lets get started
            onLaunch: function() {
                // Device detection
                var phone = isPhone();
                // console.debug('Layout profile:', phone ? 'Phone' : 'Tablet');

                Common.SharedSettings.set('android', Framework7.prototype.device.android);
                Common.SharedSettings.set('phone', phone);

                $('html').addClass(phone ? 'phone' : 'tablet');

                // Create and render main view
                this.editorView = this.createView('Editor').render();

                $$(window).on('resize', _.bind(this.onWindowResize, this));
                Common.NotificationCenter.on('layout:changed', function(source, args) {
                    if ( source == 'navbar' ) {
                        this.editorView.$el.find('.page.editor')[args.hidden?'addClass':'removeClass']('no-padding');
                    }
                }.bind(this));
            },

            onWindowResize: function(e) {
                this.api && this.api.asc_Resize();
            }
        }
    })());
});
