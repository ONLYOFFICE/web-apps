/**
 *  Viewport.js
 *
 *  Viewport view
 *
 *  Created by Alexander Yuzhin on 12/27/13
 *  Copyright (c) 2013 Ascensio System SIA. All rights reserved.
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
                        el: items[0],
                        rely: true
                    }, {
                        el: items[1],
                        rely: true
                    }, {
                        el: items[2],
                        stretch: true
                    }, {
                        el: items[3],
                        height: 25
                    }
                ]
            });

            $container = $('#viewport-hbox-layout', el);
            items = $container.find(' > .layout-item');
            this.hlayout = new Common.UI.HBoxLayout({
                box: $container,
                items: [{ // left menu chat & comment
                        el: items[0],
                        rely: true,
                        resize: {
                            hidden: true,
                            autohide: false,
                            min: 300,
                            max: 600
                    }}, { // history versions
                        el: items[3],
                        rely: true,
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
                ]
            });

            return this;
        },

        applyEditorMode: function() {
            var me              = this,
                toolbarView     = DE.getController('Toolbar').getView('Toolbar'),
                rightMenuView   = DE.getController('RightMenu').getView('RightMenu'),
                statusBarView   = DE.getController('Statusbar').getView('Statusbar');

            me._toolbar     = toolbarView.render();
            me._rightMenu   = rightMenuView.render(this.mode);

            var value = Common.localStorage.getItem('de-hidden-status');
            if (value !== null && parseInt(value) == 1)
                statusBarView.setVisible(false);
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