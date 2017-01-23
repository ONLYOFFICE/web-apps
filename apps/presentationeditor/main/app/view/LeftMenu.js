/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *    LeftMenu.js
 *
 *    Created by Maxim Kadushkin on 10 April 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/main/app/template/LeftMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/view/About',
    'common/main/lib/view/About',
    /** coauthoring begin **/
    'common/main/lib/view/Comments',
    'common/main/lib/view/Chat',
    /** coauthoring end **/
    'common/main/lib/view/Plugins',
    'common/main/lib/view/SearchDialog',
    'presentationeditor/main/app/view/FileMenu'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    var SCALE_MIN = 40;
    var MENU_SCALE_PART = 300;

    PE.Views.LeftMenu = Backbone.View.extend(_.extend({
        el: '#left-menu',

        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: function() {
            return {
                /** coauthoring begin **/
                'click #left-btn-comments': _.bind(this.onCoauthOptions, this),
                'click #left-btn-chat': _.bind(this.onCoauthOptions, this),
                'click #left-btn-plugins': _.bind(this.onCoauthOptions, this),
                /** coauthoring end **/
                'click #left-btn-support': function() {
                    var config = this.mode.customization;
                    config && !!config.feedback && !!config.feedback.url ?
                        window.open(config.feedback.url) :
                        window.open('http://support.onlyoffice.com');
                }
            }
        },

        initialize: function () {
            this.minimizedMode = true;
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
            }));

            this.btnFile = new Common.UI.Button({
                action: 'file',
                el: $('#left-btn-file'),
                hint: this.tipFile + Common.Utils.String.platformKey('Alt+F'),
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnSearch = new Common.UI.Button({
                action: 'search',
                el: $('#left-btn-search'),
                hint: this.tipSearch + Common.Utils.String.platformKey('Ctrl+F'),
                disabled: true,
                enableToggle: true
            });

            this.btnThumbs = new Common.UI.Button({
                action: 'thumbs',
                el: $('#left-btn-thumbs'),
                hint: this.tipSlides,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnAbout = new Common.UI.Button({
                action: 'about',
                el: $('#left-btn-about'),
                hint: this.tipAbout,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnSupport = new Common.UI.Button({
                action: 'support',
                el: $('#left-btn-support'),
                hint: this.tipSupport,
                disabled: true
            });

            /** coauthoring begin **/
            this.btnComments = new Common.UI.Button({
                el: $('#left-btn-comments'),
                hint: this.tipComments + Common.Utils.String.platformKey('Ctrl+Shift+H'),
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnChat = new Common.UI.Button({
                el: $('#left-btn-chat'),
                hint: this.tipChat + Common.Utils.String.platformKey('Alt+Q'),
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });

            this.btnComments.hide();
            this.btnChat.hide();

            this.btnComments.on('click',        _.bind(this.onBtnMenuClick, this));
            this.btnChat.on('click',            _.bind(this.onBtnMenuClick, this));
            /** coauthoring end **/

            this.btnPlugins = new Common.UI.Button({
                el: $('#left-btn-plugins'),
                hint: this.tipPlugins,
                enableToggle: true,
                disabled: true,
                toggleGroup: 'leftMenuGroup'
            });
            this.btnPlugins.hide();
            this.btnPlugins.on('click',         _.bind(this.onBtnMenuClick, this));
            
            this.btnSearch.on('click',          _.bind(this.onBtnMenuClick, this));
            this.btnThumbs.on('click',          _.bind(this.onBtnMenuClick, this));
            this.btnAbout.on('toggle',          _.bind(this.onBtnMenuToggle, this));
            this.btnFile.on('toggle',           _.bind(this.onBtnMenuToggle, this));
            this.btnAbout.on('click',           _.bind(this.onFullMenuClick, this));
            this.btnFile.on('click',            _.bind(this.onFullMenuClick, this));

            var menuFile = new PE.Views.FileMenu({});
            menuFile.options = {alias:'FileMenu'};
            this.btnFile.panel = menuFile.render();
            this.btnAbout.panel = (new Common.Views.About({el: $('#about-menu-panel'), appName: 'Presentation Editor'})).render();

            return this;
        },

        onBtnMenuToggle: function(btn, state) {
            if (state) {
                btn.panel['show']();
                this.$el.width(SCALE_MIN);

                if (this.btnSearch.isActive())
                    this.btnSearch.toggle(false);
            } else {
                btn.panel['hide']();
            }
            if (this.mode.isEdit) PE.getController('Toolbar').DisableToolbar(state==true);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        onBtnMenuClick: function(btn, e) {
            var full_menu_pressed = (this.btnFile.pressed || this.btnAbout.pressed);
            if (this.btnFile.pressed) this.btnFile.toggle(false);
            if (this.btnAbout.pressed) this.btnAbout.toggle(false);

            if (btn.options.action == 'search') {
                full_menu_pressed && this.fireEvent('panel:show', [this.btnFile, 'files', false]);
                return;
            } else
            if (btn.options.action == 'thumbs') {
                if (this.$el.width() > SCALE_MIN) {
                    Common.localStorage.setItem('pe-mainmenu-width',this.$el.width());
                    this.$el.width(SCALE_MIN);
                }
            } else {
                if (btn.pressed) {
                    if (!(this.$el.width() > SCALE_MIN)) {
                        this.$el.width(Common.localStorage.getItem('pe-mainmenu-width') || MENU_SCALE_PART);
                    }
                } else {
                    Common.localStorage.setItem('pe-mainmenu-width',this.$el.width());
                    this.$el.width(SCALE_MIN);
                }
            }

            this.fireEvent('panel:show', [this, btn.options.action, btn.pressed]);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        onFullMenuClick: function(btn, e) {
            (!btn.pressed) && this.fireEvent('panel:show', [this, btn.options.action, btn.pressed]);
        },

        onCoauthOptions: function(e) {
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canComments) {
                    if (this.btnComments.pressed && this.btnComments.$el.hasClass('notify'))
                        this.btnComments.$el.removeClass('notify');
                    this.panelComments[this.btnComments.pressed?'show':'hide']();
                    this.fireEvent((this.btnComments.pressed) ? 'comments:show' : 'comments:hide', this);
                }
                if (this.mode.canChat) {
                    if (this.btnChat.pressed) {
                        if (this.btnChat.$el.hasClass('notify'))
                            this.btnChat.$el.removeClass('notify');
                        this.panelChat.show();
                        this.panelChat.focus();
                    } else
                        this.panelChat['hide']();
                }
            }
            /** coauthoring end **/
            if (this.mode.canPlugins && this.panelPlugins) {
                if (this.btnPlugins.pressed) {
                    this.panelPlugins.show();
                } else
                    this.panelPlugins['hide']();
            }
        },

        setOptionsPanel: function(name, panel) {
            /** coauthoring begin **/
            if (name == 'chat') {
                this.panelChat = panel.render('#left-panel-chat');
            } else if (name == 'comment') {
                this.panelComments = panel;
            } else /** coauthoring end **/
            if (name == 'plugins' && !this.panelPlugins) {
                this.panelPlugins = panel.render('#left-panel-plugins');
            }
        },

        /** coauthoring begin **/
        markCoauthOptions: function(opt, ignoreDisabled) {
            if (opt=='chat' && this.btnChat.isVisible() &&
                    !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                this.btnChat.$el.addClass('notify');
            }
            if (opt=='comments' && this.btnComments.isVisible() && !this.btnComments.pressed &&
                                (!this.btnComments.isDisabled() || ignoreDisabled) ) {
                this.btnComments.$el.addClass('notify');
            }
        },
        /** coauthoring end **/

        close: function(menu) {
            this.btnFile.toggle(false);
            this.btnAbout.toggle(false);
            this.btnThumbs.toggle(false);
            this.$el.width(SCALE_MIN);
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canComments) {
                    this.panelComments['hide']();
                    if (this.btnComments.pressed)
                        this.fireEvent('comments:hide', this);
                    this.btnComments.toggle(false, true);
                }
                if (this.mode.canChat) {
                    this.panelChat['hide']();
                    this.btnChat.toggle(false, true);
                }
            }
            /** coauthoring end **/
            if (this.mode.canPlugins && this.panelPlugins) {
                this.panelPlugins['hide']();
                this.btnPlugins.toggle(false, true);
            }
            this.fireEvent('panel:show', [this, '', false]);
        },

        isOpened: function() {
            var isopened = this.btnFile.pressed || this.btnSearch.pressed;
            /** coauthoring begin **/
            !isopened && (isopened = this.btnComments.pressed || this.btnChat.pressed);
            /** coauthoring end **/
            return isopened;
        },

        disableMenu: function(menu, disable) {
            this.btnFile.setDisabled(disable);
            this.btnSearch.setDisabled(disable);
            this.btnThumbs.setDisabled(disable);
            this.btnAbout.setDisabled(disable);
            this.btnSupport.setDisabled(disable);
            /** coauthoring begin **/
            this.btnComments.setDisabled(disable);
            this.btnChat.setDisabled(disable);
            /** coauthoring end **/
            this.btnPlugins.setDisabled(disable);
        },

        showMenu: function(menu) {
            var re = /^(\w+):?(\w*)$/.exec(menu);
            if (re[1] == 'file' && this.btnFile.isVisible()) {
                if (!this.btnFile.pressed) {
                    this.btnFile.toggle(true);
//                    this.onBtnMenuClick(this.btnFile);
                }
                this.btnFile.panel.show(re[2].length ? re[2] : undefined);
            } else {
                /** coauthoring begin **/
                if (menu == 'chat') {
                    if (this.btnChat.isVisible() &&
                            !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                        this.btnChat.toggle(true);
                        this.onBtnMenuClick(this.btnChat);
                        this.onCoauthOptions();
                        this.panelChat.focus();
                    }
                } else
                if (menu == 'comments') {
                    if (this.btnComments.isVisible() &&
                            !this.btnComments.isDisabled() && !this.btnComments.pressed) {
                        this.btnComments.toggle(true);
                        this.onBtnMenuClick(this.btnComments);
                        this.onCoauthOptions();
                    }
                }
                /** coauthoring end **/
            }
        },

        getMenu: function(type) {
            switch (type) {
            default: return null;
            case 'file': return this.btnFile.panel;
            case 'about': return this.btnAbout.panel;
            }
        },

        setMode: function(mode) {
            this.mode = mode;
            this.btnAbout.panel.setMode(mode);
            return this;
        },

        /** coauthoring begin **/
        tipComments : 'Comments',
        tipChat     : 'Chat',
        /** coauthoring end **/
        tipAbout    : 'About',
        tipSupport  : 'Feedback & Support',
        tipFile     : 'File',
        tipSearch   : 'Search',
        tipSlides: 'Slides',
        tipPlugins  : 'Plugins'
    }, PE.Views.LeftMenu || {}));
});
