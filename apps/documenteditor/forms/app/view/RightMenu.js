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
 *  RightMenu.js
 *
 *  Created on 1/17/14
 *
 */

var SCALE_MIN = 40;
var MENU_SCALE_PART = 260;
var MENU_BASE_WIDTH = 220;

define([
    'text!documenteditor/forms/app/template/RightMenu.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/SideMenu',
    'common/main/lib/component/Button',
    'documenteditor/main/app/view/FillingStatusSettings',
    'common/main/lib/component/Scroller'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.RightMenu = Common.UI.SideMenu.extend(_.extend({
        el: '#right-menu',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        initialize: function () {
            this.minimizedMode = true;
            this.maximizedMode = false;

            this._settings = [];
            return this;
        },

        render: function (mode) {
            this.trigger('render:before', this);
            
            const showFillingStatus = !mode.canRequestFillingStatus && 
                (mode.user && mode.user.roles && mode.user.roles.length > 0);

            this.defaultHideRightMenu = !(mode.customization && (mode.customization.hideRightMenu===false));
            // var open = !Common.localStorage.getBool("de-hide-right-settings", this.defaultHideRightMenu);
            var open = false; // Only for forms mode
            Common.Utils.InternalSettings.set("de-hide-right-settings", !open);

            Common.NotificationCenter.on('app:repaint', _.bind(function() {
                this.$el.css('width', ((open) ? MENU_SCALE_PART : SCALE_MIN) + 'px');
            }, this));

            Common.NotificationCenter.on('uitheme:changed', _.bind(function() {
                this.updateWidth();
                Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
            }, this));


            var $markup = $(this.template({
                scope: this, 
                showFillingStatus: showFillingStatus
            }));
            this.$el.html($markup);

            this.updateWidth();
            this.$el.show();

            this.btnMoreContainer = $markup.find('#slot-right-menu-more');
            Common.UI.SideMenu.prototype.render.call(this);
            this.btnMore.menu.menuAlign = 'tr-tl';

            if(showFillingStatus) {
                this.btnFillingStatus = new Common.UI.Button({
                    hint: this.txtFillingStatus,
                    asctype: Common.Utils.documentSettingsType.FillingStatus,
                    enableToggle: true,
                    disabled: false,
                    cls: 'btn-toolbar',
                    scaling: false,
                    toggleGroup: 'tabpanelbtnsGroup',
                    allowMouseEventsOnDisabled: true
                });
                this._settings[Common.Utils.documentSettingsType.FillingStatus]   = {panel: "id-filling-status-settings", btn: this.btnFillingStatus};
                this.btnFillingStatus.setElement($markup.findById('#id-right-menu-filling-status'), false); 
                this.btnFillingStatus.render().setVisible(true);
                this.btnFillingStatus.on('click', this.onBtnMenuClick.bind(this));
                this.fillingStatusSettings = new DE.Views.FillingStatusSettings();
            } 

            if (_.isUndefined(this.scroller)) {
                this.scroller = new Common.UI.Scroller({
                    el: $(this.el).find('.right-panel > .content-box'),
                    suppressScrollX: true,
                    useKeyboard: false
                });
            }

            if (open) {
                $markup.findById('#id-paragraph-settings').closest('.right-panel').css("display", "inline-block" );
                $markup.findById('#id-paragraph-settings').addClass("active");
            }

            // this.$el.html($markup);
            this.trigger('render:after', this);

            return this;
        },

        setApi: function(api) {
            var me = this;
            me.api = api;
            var _fire_editcomplete = function() {me.fireEvent('editcomplete', me);};
            var _isEyedropperStart = function (isStart) {this._isEyedropperStart = isStart;};
            var _updateScroller = function () {me.updateScroller();};
            if (this.fillingStatusSettings) this.fillingStatusSettings.setApi(api).on('editcomplete', _fire_editcomplete).on('updatescroller', _updateScroller);
        },

        setMode: function(mode) {
            this.mode = mode;
            this.fillingStatusSettings && this.fillingStatusSettings.setMode(mode);
        },

        onBtnMenuClick: function(btn, e) {
            var isPlugin = btn && btn.options.type === 'plugin',
                target_pane_parent = $(this.el).find('.right-panel'),
                target_pane;
            if (btn && !isPlugin) {
                target_pane = $("#" + this._settings[btn.options.asctype].panel);
            }

            if (btn && btn.pressed) {
                if ( this.minimizedMode ) {
                    $(this.el).width(MENU_SCALE_PART);
                    target_pane_parent.css("display", "inline-block" );
                    this.minimizedMode = false;
                    Common.localStorage.setItem("de-hide-right-settings", 0);
                    Common.Utils.InternalSettings.set("de-hide-right-settings", false);
                }
                target_pane_parent.find('.content-box > .active').removeClass('active');
                target_pane && target_pane.addClass("active");

                const widthFromStorage = Common.localStorage.getItem('de-rightmenu-width');
                if(isPlugin && widthFromStorage) {
                    this.$el.width(parseInt(widthFromStorage));
                } else {
                    this.setInnerWidth(MENU_BASE_WIDTH);
                }
                Common.NotificationCenter.trigger('layout:changed', 'rightmenu');

                if (this.scroller) {
                    this.scroller.scrollTop(0);
                }
            } else {
                target_pane_parent.css("display", "none" );
                $(this.el).width(SCALE_MIN);
                this.minimizedMode = true;
                Common.localStorage.setItem("de-hide-right-settings", 1);
                Common.Utils.InternalSettings.set("de-hide-right-settings", true);
            }

            btn && !isPlugin && this.fireEvent('rightmenuclick', [this, btn.options.asctype, this.minimizedMode, e]);


            btn.$el.blur();
        },

        SetActivePane: function(type, open) {
            if (this.minimizedMode && open!==true || this._settings[type]===undefined ) return;

            if (this.minimizedMode) {
                this._settings[type].btn.toggle(true, false);
                this._settings[type].btn.trigger('click', this._settings[type].btn);
            } else {
                var target_pane = this.$el.find("#" + this._settings[type].panel );
                if ( !target_pane.hasClass('active') ) {
                    target_pane.parent().find('> .active').removeClass('active');
                    target_pane.addClass("active");
                    if (this.scroller) {
                        this.scroller.update();
                        this.scroller.scrollTop(0);
                    }
                }
                if (!this._settings[type].btn.isActive())
                    this._settings[type].btn.toggle(true, false);
            }
        },

        GetActivePane: function() {
            var active = this.$el.find(".settings-panel.active");
            return (this.minimizedMode || active.length === 0) ? null : active[0].id;
        },

        GetActivePluginPane: function() {
            var active = this.$el.find(".plugin-panel.active");
            return (this.minimizedMode || active.length === 0) ? null : active[0].id;
        },

        clearSelection: function() {
            if (this.mergeSettings)
                this.mergeSettings.disablePreviewMode();

            var target_pane = $(".right-panel");
            target_pane.find('.content-box > .active').removeClass('active');
            this._settings.forEach(function(item){
                if (item.btn.isActive())
                    item.btn.toggle(false, true);
            });
            target_pane.css("display", "none" );
            $(this.el).width(SCALE_MIN);
            this.minimizedMode = true;
            Common.NotificationCenter.trigger('layout:changed', 'rightmenu');
        },

        updateScroller: function() {
            if (this.scroller) {
                this.scroller.update();
                this.scroller.scrollTop(0);
            }
        },

        setButtons: function () {
            var allButtons = [this.btnFillingStatus];
            Common.UI.SideMenu.prototype.setButtons.apply(this, [allButtons]);
        },

        insertPanel: function ($panel) {
            this.$el.find('.side-panel .content-box').append($panel);
        },

        setInnerWidth: function(value) {
            const pane = $(this.el).find('.right-panel');
            const paddings = parseInt(pane.css('padding-left')) + parseInt(pane.css('padding-right'));
            MENU_SCALE_PART = value + paddings;
            this.$el.css('width', (!Common.Utils.InternalSettings.get("de-hide-right-settings") ? MENU_SCALE_PART : SCALE_MIN) + 'px');
        },

        updateWidth: function() {
            var pane = $(this.el).find('.right-panel'),
                paddings = parseInt(pane.css('padding-left')) + parseInt(pane.css('padding-right'));
            MENU_SCALE_PART = MENU_BASE_WIDTH + paddings;
            this.$el.css('width', (!Common.Utils.InternalSettings.get("de-hide-right-settings") ? MENU_SCALE_PART : SCALE_MIN) + 'px');
        },

        txtFillingStatus:           'Filling status',
        ariaRightMenu:              'Right menu'
    }, DE.Views.RightMenu || {}));
});