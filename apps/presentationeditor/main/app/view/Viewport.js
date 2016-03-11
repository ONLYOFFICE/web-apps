/**
 *    Viewport.js
 *
 *    View for viewport
 *
 *    Created by Julia Radzhabova on 26 March 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/main/app/template/Viewport.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function (viewportTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.Viewport = Backbone.View.extend({
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
                }]
            });

            $container = $('#viewport-hbox-layout', el);
            items = $container.find(' > .layout-item');
            this.hlayout = new Common.UI.HBoxLayout({
                box: $container,
                items: [{
                    el: items[0],
                    rely: true,
                    resize: {
                        hidden: true,
                        autohide: false,
                        min: 300,
                        max: 600
                }}, {
                    el: items[1],
                    stretch: true
                }, {
                    el: $(items[2]).hide(),
                    rely: true
                }
                ]
            });

            return this;
        },

        applyEditorMode: function() {
            var me              = this,
                toolbarView     = PE.getController('Toolbar').getView('Toolbar'),
                rightMenuView   = PE.getController('RightMenu').getView('RightMenu'),
                statusBarView   = PE.getController('Statusbar').getView('Statusbar');

            me._toolbar     = toolbarView.render();
            me._rightMenu   = rightMenuView.render();

            var value = Common.localStorage.getItem('pe-hidden-status');
            if (value !== null && parseInt(value) == 1)
                statusBarView.setVisible(false);
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
            }
        }
    });
});
