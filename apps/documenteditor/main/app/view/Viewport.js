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
 *  Viewport.js
 *
 *  Viewport view
 *
 *  Created on 12/27/13
 *
 */

define([
    'text!documenteditor/main/app/template/Viewport.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Layout'
], function (viewportTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.Viewport = Backbone.View.extend({
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
            this.$el.html(this.template({}));

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

            var $container = $('#viewport-vbox-layout', this.$el);
            this.vlayout = new Common.UI.VBoxLayout({
                box: $container,
                items: [{
                        el: $container.find('> .layout-item#app-title').hide(),
                        alias: 'title',
                        height: Common.Utils.InternalSettings.get('document-title-height')
                    }, {
                        el: $container.find(' > .layout-item#toolbar'),
                        alias: 'toolbar',
                        // rely: true
                        height: Common.localStorage.getBool('de-compact-toolbar') ?
                            Common.Utils.InternalSettings.get('toolbar-height-compact') : Common.Utils.InternalSettings.get('toolbar-height-normal')
                    }, {
                        el: $container.find(' > .layout-item.middle'),
                        stretch: true
                    }, {
                        el: $container.find(' > .layout-item#statusbar'),
                        alias: 'statusbar',
                        height: parseInt(window.getComputedStyle(document.body).getPropertyValue('--statusbar-height') || 25)
                    }
                ]
            });

            $container = $('#viewport-hbox-layout', this.$el);
            var items = $container.find(' > .layout-item');
            let iarray = [{ // left menu chat & comment
                el: items[0],
                rely: true,
                alias: 'left',
                resize: {
                    hidden: true,
                    autohide: false,
                    min: 300,
                    max: 600
                }}, { // history versions
                el: items[3],
                rely: true,
                alias: 'history',
                resize: {
                    hidden: true,
                    autohide: false,
                    min: 300,
                    max: 600
                }
            }, { // sdk
                el: items[1],
                stretch: true
            }, { // right menu
                el: $(items[2]).hide(),
                rely: true
            }
            ];

            if ( Common.UI.isRTL() ) {
                iarray[0].resize.min = -600;
                iarray[0].resize.max = -300;
                [iarray[1].resize.min, iarray[1].resize.max] = [-600, -300];

                [iarray[0], iarray[3]] = [iarray[3], iarray[0]];
                [iarray[1], iarray[2]] = [iarray[2], iarray[1]];
            }

            this.hlayout = new Common.UI.HBoxLayout({
                box: $container,
                items: iarray
            });

            return this;
        },

        applyEditorMode: function() {
            var me              = this,
                rightMenuView   = DE.getController('RightMenu').getView('RightMenu');

            me._rightMenu   = rightMenuView.render(this.mode);
            var value = Common.UI.LayoutManager.getInitValue('rightMenu');
            value = (value!==undefined) ? !value : false;
            Common.localStorage.getBool("de-hidden-rightmenu", value) && me._rightMenu.hide();
            Common.Utils.InternalSettings.set("de-hidden-rightmenu", Common.localStorage.getBool("de-hidden-rightmenu", value));
        },

        applyCommonMode: function() {
            if ( Common.localStorage.getBool('de-hidden-status') )
                DE.getController('Statusbar').getView('Statusbar').setVisible(false);

            var value = Common.UI.LayoutManager.getInitValue('leftMenu');
            value = (value!==undefined) ? !value : false;
            Common.localStorage.getBool("de-hidden-leftmenu", value) && DE.getController('LeftMenu').getView('LeftMenu').hide();
        },

        setMode: function(mode) {
            if (mode.isDisconnected) {
                /** coauthoring begin **/
                if (_.isUndefined(this.mode))
                    this.mode = {};

                this.mode.canCoAuthoring = false;
                /** coauthoring end **/
            } else {
                this.mode = mode;
            }
        }
    });
});