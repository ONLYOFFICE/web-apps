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
define([
    'text!spreadsheeteditor/main/app/template/LeftMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/SideMenu',
    'common/main/lib/component/Button',
    'common/main/lib/view/About',
    /** coauthoring begin **/
    'common/main/lib/view/Comments',
    'common/main/lib/view/Chat',
    'common/main/lib/view/History',
    /** coauthoring end **/
    'common/main/lib/view/Plugins',
    'spreadsheeteditor/main/app/view/FileMenu'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    var SCALE_MIN = 40;
    var MENU_SCALE_PART = 300;

    SSE.Views.LeftMenu = Common.UI.SideMenu.extend(_.extend({
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
            this.btnSearchBar.on('click',       _.bind(this.onBtnMenuClick, this));

            this.btnAbout = new Common.UI.Button({
                action: 'about',
                el: $markup.elementById('#left-btn-about'),
                hint: this.tipAbout,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-about',
                toggleGroup: 'leftMenuGroup'
            });
            this.btnAbout.on('toggle',          _.bind(this.onBtnMenuToggle, this));

            this.btnSupport = new Common.UI.Button({
                action: 'support',
                el: $markup.elementById('#left-btn-support'),
                hint: this.tipSupport,
                disabled: true,
                iconCls: 'btn-menu-support'
            });
            this.btnSupport.on('click', _.bind(function() {
                var config = this.mode.customization;
                config && !!config.feedback && !!config.feedback.url ?
                    window.open(config.feedback.url) :
                    window.open('{{SUPPORT_URL}}');
            }, this));

            /** coauthoring begin **/
            this.btnComments = new Common.UI.Button({
                el: $markup.elementById('#left-btn-comments'),
                hint: this.tipComments +  Common.Utils.String.platformKey('Ctrl+Shift+H'),
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-comments',
                toggleGroup: 'leftMenuGroup'
            });
            this.btnComments.on('toggle',       this.onBtnCommentsToggle.bind(this));
            this.btnComments.on('click',        this.onBtnMenuClick.bind(this));

            this.btnChat = new Common.UI.Button({
                el: $markup.elementById('#left-btn-chat'),
                hint: this.tipChat + Common.Utils.String.platformKey('Alt+Q', ' (' + (Common.Utils.isMac ? Common.Utils.String.textCtrl + '+' : '') + '{0})'),
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-menu-chat',
                toggleGroup: 'leftMenuGroup'
            });
            this.btnChat.on('click',            this.onBtnMenuClick.bind(this));

            this.btnComments.hide();
            this.btnChat.hide();
            /** coauthoring end **/

            this.btnSpellcheck = new Common.UI.Button({
                el: $markup.elementById('#left-btn-spellcheck'),
                hint: this.tipSpellcheck,
                enableToggle: true,
                disabled: true,
                iconCls: 'btn-ic-docspell',
                toggleGroup: 'leftMenuGroup'
            });
            this.btnSpellcheck.hide();
            this.btnSpellcheck.on('click',      _.bind(this.onBtnMenuClick, this));

            this.menuFile = new SSE.Views.FileMenu({});
            this.btnAbout.panel = (new Common.Views.About({el: '#about-menu-panel', appName: this.txtEditor}));

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
            SSE.getController('Toolbar').DisableToolbar(state==true);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        onBtnCommentsToggle: function(btn, state) {
            if (!state)
                this.fireEvent('comments:hide', this);
        },

        onBtnMenuClick: function(btn, e) {
            this.btnAbout.toggle(false);

            if (btn.pressed) {
                if (!(this.$el.width() > SCALE_MIN)) {
                    this.$el.width(Common.localStorage.getItem('sse-mainmenu-width') || MENU_SCALE_PART);
                }
            } else if (!this._state.pluginIsRunning){
                var width = this.$el.width();
                this.isVisible() && (width>SCALE_MIN) && Common.localStorage.setItem('sse-mainmenu-width',width);
                this.$el.width(SCALE_MIN);
            }
            this.onCoauthOptions();
            btn.pressed && btn.options.action == 'advancedsearch' && this.fireEvent('search:aftershow', this);
            Common.NotificationCenter.trigger('layout:changed', 'leftmenu');
        },

        /** coauthoring begin **/
        onCoauthOptions: function(e) {
            if (this.mode.canCoAuthoring) {
                if (this.mode.canViewComments) {
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
            if (this.panelSpellcheck) {
                if (this.btnSpellcheck.pressed) {
                    this.panelSpellcheck.show();
                } else
                    this.panelSpellcheck['hide']();
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
            } else if (name == 'comment') {
                this.panelComments = panel;
            } else
            if (name == 'spellcheck' && !this.panelSpellcheck) {
                this.panelSpellcheck = panel.render('#left-panel-spellcheck');
            } else if (name == 'history') {
                this.panelHistory = panel.render('#left-panel-history');
            } else
            if (name == 'advancedsearch') {
                this.panelSearch = panel.render('#left-panel-search');
            }
        },

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
            this.btnAbout.toggle(false);
            if (!this._state.pluginIsRunning)
                this.$el.width(SCALE_MIN);
            /** coauthoring begin **/
            if (this.mode.canCoAuthoring) {
                if (this.mode.canViewComments) {
                    this.panelComments['hide']();
                    if (this.btnComments.pressed)
                        this.fireEvent('comments:hide', this);
                    this.btnComments.toggle(false, true);
                }
                if (this.mode.canChat) {
                    this.panelChat['hide']();
                    this.btnChat.toggle(false);
                }
            }
            /** coauthoring end **/
            if (this.panelSpellcheck) {
                this.panelSpellcheck['hide']();
                this.btnSpellcheck.toggle(false, true);
            }
            if (this.panelSearch) {
                this.panelSearch['hide']();
                this.btnSearchBar.toggle(false, true);
            }
            this.toggleActivePluginButton(false);
        },

        isOpened: function() {
            var isopened = this.btnSearchBar.pressed;
            /** coauthoring begin **/
            !isopened && (isopened = this.btnComments.pressed || this.btnChat.pressed);
            /** coauthoring end **/
            return isopened;
        },

        disableMenu: function(menu, disable) {
            this.btnAbout.setDisabled(false);
            this.btnSupport.setDisabled(false);
            this.btnSearchBar.setDisabled(false);
            /** coauthoring begin **/
            this.btnComments.setDisabled(false);
            this.btnChat.setDisabled(false);
            /** coauthoring end **/
            this.btnSpellcheck.setDisabled(false);
        },

        showMenu: function(menu, opts) {
            var re = /^(\w+):?(\w*)$/.exec(menu);
            if ( re[1] == 'file' ) {
                if (!Common.Controllers.LaunchController.isScriptLoaded()) return;
                this.menuFile.show(re[2].length ? re[2] : undefined, opts);
            } else {
                /** coauthoring begin **/
                if (menu == 'chat') {
                    if (this.btnChat.isVisible() &&
                            !this.btnChat.isDisabled() && !this.btnChat.pressed) {
                        this.btnChat.toggle(true);
                        this.onBtnMenuClick(this.btnChat);
                        this.panelChat.focus();
                    }
                } else
                if (menu == 'comments') {
                    if (this.btnComments.isVisible() &&
                            !this.btnComments.isDisabled() && !this.btnComments.pressed) {
                        this.btnComments.toggle(true);
                        this.onBtnMenuClick(this.btnComments);
                        this.btnComments.$el.focus();
                    }
                } else if (menu == 'advancedsearch') {
                    if (this.btnSearchBar.isVisible() &&
                        !this.btnSearchBar.isDisabled() && !this.btnSearchBar.pressed) {
                        this.btnSearchBar.toggle(true);
                        this.onBtnMenuClick(this.btnSearchBar);
                    }
                }
                /** coauthoring end **/
            }
        },

        getMenu: function(type) {
            switch (type) {
            case 'file': return this.menuFile;
            case 'about': return this.btnAbout.panel;
            default: return null;
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
            this.minDevPosition = (lastbtn) ? (lastbtn.offset().top - lastbtn.offsetParent().offset().top + lastbtn.height() + 20) : 20;
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
            this.minDevPosition = (lastbtn) ? (lastbtn.offset().top - lastbtn.offsetParent().offset().top + lastbtn.height() + 20) : 20;
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

        showHistory: function() {
            this._state.pluginIsRunning = false;
            this._state.historyIsRunning = true;
            this.panelHistory.show();
            this.panelHistory.$el.width((parseInt(Common.localStorage.getItem('sse-mainmenu-width')) || MENU_SCALE_PART) - SCALE_MIN);
            Common.NotificationCenter.trigger('layout:changed', 'history');
        },

        isVisible: function () {
            return this.$el && this.$el.is(':visible');
        },

        setButtons: function () {
            var allButtons = [this.btnSearchBar, this.btnComments, this.btnChat, this.btnSpellcheck, this.btnSupport, this.btnAbout];
            Common.UI.SideMenu.prototype.setButtons.apply(this, [allButtons]);
        },

        /** coauthoring begin **/
        tipComments : 'Comments',
        tipChat     : 'Chat',
        /** coauthoring end **/
        tipAbout    : 'About',
        tipSupport  : 'Feedback & Support',
        tipFile     : 'File',
        tipSearch   : 'Search',
        tipPlugins  : 'Plugins',
        txtDeveloper: 'DEVELOPER MODE',
        txtTrial: 'TRIAL MODE',
        tipSpellcheck: 'Spell checking',
        txtTrialDev: 'Trial Developer Mode',
        txtLimit: 'Limit Access',
        txtEditor: 'Spreadsheet Editor',
        ariaLeftMenu: 'Left menu'
    }, SSE.Views.LeftMenu || {}));
});
