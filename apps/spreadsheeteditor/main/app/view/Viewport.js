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
 *    Viewport.js
 *
 *    View for viewport
 *
 *    Created on 24 March 2014
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/Viewport.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function (viewportTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.Viewport = Backbone.View.extend({
        el: '#viewport',

        // Compile our stats template
        template: _.template(viewportTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        // Set innerHTML and get the references to the DOM elements
        initialize: function() {
            //
        },

        // Render layout
        render: function() {
            var el = $(this.el);
            el.html(this.template({}));

            // Workaround Safari's scrolling problem
            if (Common.Utils.isSafari) {
                $('body').addClass('safari');
                $('body').mousewheel(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                });
            } else if (Common.Utils.isChrome) {
                $('body').addClass('chrome');
            }

            var $container = $('#viewport-vbox-layout', el);
            var items = $container.find(' > .layout-item');
            this.vlayout = new Common.UI.VBoxLayout({
                box: $container,
                items: [{
                    el: $container.find('> .layout-item#app-title').hide(),
                    alias: 'title',
                    height: Common.Utils.InternalSettings.get('document-title-height')
                },{
                    el: items[1],
                    alias: 'toolbar',
                    height: Common.localStorage.getBool('sse-compact-toolbar') ?
                        Common.Utils.InternalSettings.get('toolbar-height-compact') : Common.Utils.InternalSettings.get('toolbar-height-normal')
                }, {
                    el: items[2],
                    stretch: true
                }, {
                    el: items[3],
                    alias: 'statusbar',
                    height: (function () {
                        var h = parseInt(getComputedStyle(document.body).getPropertyValue('--statusbar-height') || 25);
                        return Common.localStorage.getBool('sse-compact-statusbar', true) ? h : h * 2;
                    })()
                }]
            });

            $container = $('#viewport-hbox-layout', el);
            items = $container.find(' > .layout-item');

            let iarray = [{
                el: items[0],
                rely: true,
                alias: 'left',
                resize: {
                    hidden: true,
                    autohide: false,
                    min: 300,
                    max: 600,
                    offset: 4
                }
            }, { // history versions
                el: items[3],
                rely: true,
                alias: 'history',
                resize: {
                    hidden: true,
                    autohide: false,
                    min: 300,
                    max: 600
                }
            }, {
                el: items[1],
                stretch: true
            }, {
                el: $(items[2]).hide(),
                rely: true,
                alias: 'right',
                resize: {
                    hidden: true,
                    autohide: false,
                    min: -600,
                    max: -260
                }
            }];

            if ( Common.UI.isRTL() ) {
                [iarray[0].resize.min, iarray[0].resize.max] = [-600, -300];
                [iarray[1].resize.min, iarray[1].resize.max] = [-600, -300];
                [iarray[3].resize.min, iarray[3].resize.max] = [260, 600];

                [iarray[0], iarray[3]] = [iarray[3], iarray[0]];
                [iarray[1], iarray[2]] = [iarray[2], iarray[1]];
            }

            this.hlayout = new Common.UI.HBoxLayout({
                box: $container,
                items: iarray
            });

            $container = $container.find('.layout-ct.vbox');
            items = $container.find(' > .layout-item');
            this.celayout = new Common.UI.VBoxLayout({
                box: $container,
                items: [{
                    el: items[0],
                    rely: true,
                    alias: 'celleditor',
                    resize: this.getCelleditorResizeOptions()
                }, {
                    el: items[1],
                    stretch: true
                }]
            });

            return this;
        },

        getCelleditorResizeOptions: function() {
            var computedStyle = window.getComputedStyle(document.body);
            var resizeOptions = {
                min: (parseFloat(computedStyle.getPropertyValue("--celleditor-height")) || 20) - 1,
                max: -100,
                multiply: {}
            }; 
            resizeOptions.multiply.koeff = parseFloat(computedStyle.getPropertyValue("--celleditor-line-height")) || 18;
            resizeOptions.multiply.offset = (parseInt(computedStyle.getPropertyValue("--celleditor-height")) || 20) - resizeOptions.multiply.koeff;
            return resizeOptions;
        },

        applyEditorMode: function() {
            var me              = this,
                rightMenuView   = SSE.getController('RightMenu').getView('RightMenu');

            me._rightMenu   = rightMenuView.render(this.mode);
            var value = Common.UI.LayoutManager.getInitValue('rightMenu');
            value = (value!==undefined) ? !value : false;
            Common.localStorage.getBool("sse-hidden-rightmenu", value) && me._rightMenu.hide();
        },

        applyCommonMode: function() {
            var value = Common.UI.LayoutManager.getInitValue('leftMenu');
            value = (value!==undefined) ? !value : false;
            Common.localStorage.getBool("sse-hidden-leftmenu", value) && SSE.getController('LeftMenu').getView('LeftMenu').hide();
        },

        setMode: function(mode, delay) {
            if (mode.isDisconnected) {
                /** coauthoring begin **/
                if (_.isUndefined(this.mode))
                    this.mode = {};

                this.mode.canCoAuthoring = false;
                /** coauthoring end **/
            } else {
                this.mode = mode;
                if (this.vlayout && mode.isDesktopApp && !mode.isEdit)
                    this.vlayout.items[1].el.css('display', 'block');
            }
        }
    });
});