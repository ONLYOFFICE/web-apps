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
 *    LeftMenu.js
 *
 *    Created on 11/07/24
 *
 */

define([
    'text!visioeditor/main/app/template/LeftMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/SideMenu',
    'common/main/lib/component/Button',
    'common/main/lib/view/Chat',
    'common/main/lib/view/Plugins',
    'common/main/lib/view/About',
    'visioeditor/main/app/view/FileMenu'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    var SCALE_MIN = 40;
    var MENU_SCALE_PART = 300;

    VE.Views.LeftMenu = Common.UI.SideMenu.extend(_.extend({
        el: '#left-menu',

        template: _.template(menuTemplate),

        initialize: function () {
            this.minimizedMode = true;
            this._state = {disabled: false};
        },

        render: function () {
            var $markup = $(this.template({scope: this}));

            this.btnMoreContainer = $markup.find('#slot-left-menu-more');
            Common.UI.SideMenu.prototype.render.call(this);
            this.btnMore.menu.menuAlign = 'tl-tr';

            this.btnSearchBar = new Common.UI.Button({
                action: 'advancedsearch',
                el: $markup.elementById('#left-btn-searchbar'),
                hint: this.tipSearch,
                disabled: true,
                iconCls: 'btn-menu-search',
                enableToggle: true,
                toggleGroup: 'leftMenuGroup'
            });
            this.btnSearchBar.on('click',       this.onBtnMenuClick.bind(this));

            this.btnAbout = new Common.UI.Button({
                action: 'about',
                el: $markup.elementById('#left-btn-about'),
                hint: this.tipAbout,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-about',
                toggleGroup: 'leftMenuGroup'
            });
            this.btnAbout.on('toggle',          this.onBtnMenuToggle.bind(this));

            this.btnSupport = new Common.UI.Button({
                action: 'support',
                el: $markup.elementById('#left-btn-support'),
                hint: this.tipSupport,
                iconCls: 'btn-menu-support',
                disabled: true
            });
            this.btnSupport.on('click', _.bind(function() {
                var config = this.mode.customization;
                config && !!config.feedback && !!config.feedback.url ?
                    window.open(config.feedback.url) :
                    window.open('{{SUPPORT_URL}}');
                Common.NotificationCenter.trigger('edit:complete', this);
            }, this));

            this.btnChat = new Common.UI.Button({
                el: $markup.elementById('#left-btn-chat'),
                hint: this.tipChat,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-chat',
                toggleGroup: 'leftMenuGroup'
            });
            this.btnChat.on('click',            this.onBtnMenuClick.bind(this));
            VE.getController('Common.Controllers.Shortcuts').updateShortcutHints({
                OpenChatPanel: {
                    btn: this.btnChat,
                    label: this.tipChat + Common.Utils.String.platformKey('Alt+Q', ' (' + (Common.Utils.isMac ? Common.Utils.String.textCtrl + '+' : '') + '{0})')
                }
            });

            this.btnChat.hide();

            this.menuFile = new VE.Views.FileMenu();
            this.btnAbout.panel = new Common.Views.About({el: '#about-menu-panel', appName: this.txtEditor});

            this.btnThumbs = new Common.UI.Button({
                action: 'thumbs',
                el: $markup.elementById('#left-btn-thumbs'),
                hint: this.tipPages,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-thumbs',
                toggleGroup: 'leftMenuGroup'
            });
            this.btnThumbs.on('click',          _.bind(this.onBtnMenuClick, this));

            this.$el.html($markup);

            return this;
        },

        onBtnMenuToggle: function(btn, state) {
            if (state) {
                btn.panel['show']();
                if (!this._state.pluginIsRunning)
                    this.$el.width(SCALE_MIN);
            } else {
                btn.panel['hide']();
            }
            VE.getController('Toolbar').DisableToolbar(state==true);
            if (!this.supressEvents)
                Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        onBtnMenuClick: function(btn, e) {
            this.supressEvents = true;
            if (this.btnAbout.pressed) this.btnAbout.toggle(false);

            if (btn.options.action == 'thumbs') {
                if (!btn.pressed && this._state.pluginIsRunning) {
                    this.$el.width(Common.localStorage.getItem('ve-mainmenu-width') || MENU_SCALE_PART);
                } else {
                    var width = this.$el.width();
                    if (width > SCALE_MIN) {
                        Common.localStorage.setItem('ve-mainmenu-width',width);
                        this.$el.width(SCALE_MIN);
                    }
                    if (this._state.pluginIsRunning) // hide comments or chat panel when plugin is running
                        this.onCoauthOptions();
                }
            } else {
                if (btn.pressed) {
                    if (!(this.$el.width() > SCALE_MIN)) {
                        this.$el.width(Common.localStorage.getItem('ve-mainmenu-width') || MENU_SCALE_PART);
                    }
                } else if (!this._state.pluginIsRunning){
                    var width = this.$el.width();
                    this.isVisible() && (width>SCALE_MIN) && Common.localStorage.setItem('ve-mainmenu-width',width);
                    this.$el.width(SCALE_MIN);
                }
                this.onCoauthOptions();
            }

            btn.options.type !== 'plugin' && $('.left-panel .plugin-panel').toggleClass('active', false);
            this.fireEvent('panel:show', [this, btn.options.action, btn.pressed]);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');

            this.supressEvents = false;
        },

        onCoauthOptions: function(e) {
            if (this.mode.canCoAuthoring) {
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
            if (this.panelSearch) {
                if (this.btnSearchBar.pressed) {
                    this.panelSearch.show();
                    this.panelSearch.focus();
                } else {
                    this.panelSearch.hide();
                }
            }
        },

        getFocusElement: function () {
            var btn = false;
            if (this.btnChat && this.btnChat.pressed) {
                btn = this.panelChat.getFocusElement();
            } else if (this.btnSearchBar && this.btnSearchBar.pressed) {
                btn = this.panelSearch.getFocusElement();
            }
            return btn;
        },

        setOptionsPanel: function(name, panel) {
            if (name == 'chat') {
                this.panelChat = panel.render('#left-panel-chat');
            } else
            if (name == 'advancedsearch') {
                this.panelSearch = panel.render('#left-panel-search');
            }
        },

        markCoauthOptions: function(opt, ignoreDisabled) {
            if (opt=='chat' && (this.btnChat.isVisible() || this.isButtonInMoreMenu(this.btnChat)) &&
                    !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                this.btnChat.$el.addClass('notify');
            }
        },

        close: function(menu) {
            if ( this.menuFile.isVisible() ) {
                this.menuFile.hide();
            } else {
                this.btnAbout.toggle(false);
                this.btnThumbs.toggle(false, !this.mode);
                if (!this._state.pluginIsRunning)
                    this.$el.width(SCALE_MIN);
                if (this.mode && this.mode.canCoAuthoring) {
                    if (this.mode.canChat) {
                        this.panelChat && this.panelChat['hide']();
                        this.btnChat.toggle(false);
                    }
                }
                if (this.panelSearch) {
                    this.panelSearch['hide']();
                    this.btnSearchBar.toggle(false, true);
                }
                this.toggleActivePluginButton(false);
            }
        },

        isOpened: function() {
            var isopened = this.btnSearchBar.pressed;
            !isopened && (isopened = this.btnChat.pressed);
            return isopened;
        },

        disableMenu: function(menu, disable) {
            this.btnSearchBar.setDisabled(false);
            this.btnAbout.setDisabled(false);
            this.btnSupport.setDisabled(false);
            this.btnChat.setDisabled(false);
            this.btnThumbs.setDisabled(disable);
            this.setDisabledAllMoreMenuItems(false);
        },

        showMenu: function(menu, opts, suspendAfter) {
            var re = /^(\w+):?(\w*)$/.exec(menu);
            if ( re[1] == 'file' ) {
                if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
                if ( !this.menuFile.isVisible() ) {
                    // this.btnFile.toggle(true);
                }
                this.menuFile.show(re[2].length ? re[2] : undefined, opts);
            } else {
                if (menu == 'chat') {
                    if ((this.btnChat.isVisible() || this.isButtonInMoreMenu(this.btnChat)) &&
                            !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                        this.btnChat.toggle(true);
                        this.onBtnMenuClick(this.btnChat);
                        this.panelChat.focus();
                    }
                } else if (menu == 'advancedsearch') {
                    if ((this.btnSearchBar.isVisible() || this.isButtonInMoreMenu(this.btnSearchBar)) &&
                        !this.btnSearchBar.isDisabled() && !this.btnSearchBar.pressed) {
                        this.btnSearchBar.toggle(true);
                        this.onBtnMenuClick(this.btnSearchBar);
                        this.panelSearch.focus();
                        !suspendAfter && this.fireEvent('search:aftershow', this);
                    }
                }
            }
        },

        getMenu: function(type) {
            switch (type) {
            default: return null;
            case 'file': return this.menuFile;
            case 'about': return this.btnAbout.panel;
            }
        },

        setMode: function(mode) {
            this.mode = mode;
            this.btnAbout.panel.setMode(mode);
            return this;
        },

        setDeveloperMode: function(mode, beta, version) {
            if ( !this.$el.is(':visible') ) return;

            if ((mode & Asc.c_oLicenseMode.Trial) || (mode & Asc.c_oLicenseMode.Developer)) {
                if (!this.developerHint) {
                    var str = '';
                    if ((mode & Asc.c_oLicenseMode.Trial) && (mode & Asc.c_oLicenseMode.Developer))
                        str = this.txtTrialDev;
                    else if ((mode & Asc.c_oLicenseMode.Trial)!==0)
                        str = this.txtTrial;
                    else if ((mode & Asc.c_oLicenseMode.Developer)!==0)
                        str = this.txtDeveloper;
                    str = str.toUpperCase();
                    this.developerHint = $('<div id="developer-hint">' + str + '</div>').appendTo(this.$el);
                    this.devHeight = this.developerHint.outerHeight();
                    !this.devHintInited && $(window).on('resize', _.bind(this.onWindowResize, this));
                    this.devHintInited = true;
                }
            }
            this.developerHint && this.developerHint.toggleClass('hidden', !((mode & Asc.c_oLicenseMode.Trial) || (mode & Asc.c_oLicenseMode.Developer)));

            if (beta) {
                if (!this.betaHint) {
                    var style = (mode) ? 'style="margin-top: 4px;"' : '',
                        arr = (version || '').split('.'),
                        ver = '';
                    (arr.length>0) && (ver += ('v. ' + arr[0]));
                    (arr.length>1) && (ver += ('.' + arr[1]));
                    this.betaHint = $('<div id="beta-hint"' + style + '>' + (ver + ' (beta)' ) + '</div>').appendTo(this.$el);
                    this.betaHeight = this.betaHint.outerHeight();
                    !this.devHintInited && $(window).on('resize', _.bind(this.onWindowResize, this));
                    this.devHintInited = true;
                }
            }
            this.betaHint && this.betaHint.toggleClass('hidden', !beta);

            var btns = this.$el.find('button.btn-category:visible'),
                lastbtn = (btns.length>0) ? $(btns[btns.length-1]) : null;
            this.minDevPosition = (lastbtn) ? (Common.Utils.getOffset(lastbtn).top - Common.Utils.getOffset(lastbtn.offsetParent()).top + lastbtn.height() + 20) : 20;
            this.onWindowResize();
        },

        setLimitMode: function() {
            if ( !this.$el.is(':visible') ) return;

            if (!this.limitHint) {
                var str = this.txtLimit.toUpperCase();
                this.limitHint = $('<div id="limit-hint" style="margin-top: 4px;">' + str + '</div>').appendTo(this.$el);
                this.limitHeight = this.limitHint.outerHeight();
                !this.devHintInited && $(window).on('resize', _.bind(this.onWindowResize, this));
                this.devHintInited = true;
            }
            this.limitHint && this.limitHint.toggleClass('hidden', false);

            var btns = this.$el.find('button.btn-category:visible'),
                lastbtn = (btns.length>0) ? $(btns[btns.length-1]) : null;
            this.minDevPosition = (lastbtn) ? (Common.Utils.getOffset(lastbtn).top - Common.Utils.getOffset(lastbtn.offsetParent()).top + lastbtn.height() + 20) : 20;
            this.onWindowResize();
        },

        onWindowResize: function() {
            var height = (this.devHeight || 0) + (this.betaHeight || 0) + (this.limitHeight || 0);
            var top = Math.max((this.$el.height()-height)/2, this.minDevPosition);
            if (this.developerHint) {
                this.developerHint.css('top', top);
                top += this.devHeight;
            }
            if (this.betaHint) {
                this.betaHint.css('top', top);
                top += (this.betaHeight + 4);
            }
            this.limitHint && this.limitHint.css('top', top);
        },

        isVisible: function () {
            return this.$el && this.$el.is(':visible');
        },

        setButtons: function () {
            var allButtons = [/*this.btnSearchBar,*/ this.btnThumbs, this.btnChat, this.btnSupport, this.btnAbout];
            Common.UI.SideMenu.prototype.setButtons.apply(this, [allButtons]);
        },

        tipChat     : 'Chat',
        tipAbout    : 'About',
        tipSupport  : 'Feedback & Support',
        tipSearch   : 'Search',
        tipPlugins  : 'Plugins',
        tipPages: 'Pages',
        txtDeveloper: 'DEVELOPER MODE',
        txtTrial: 'TRIAL MODE',
        txtTrialDev: 'Trial Developer Mode',
        txtLimit: 'Limit Access',
        txtEditor: 'Visio Editor',
        ariaLeftMenu: 'Left menu'
    }, VE.Views.LeftMenu || {}));
});
