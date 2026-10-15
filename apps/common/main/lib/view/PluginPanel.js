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
 * Date: 22.07.23
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([], function () {
    'use strict';

    Common.Views.PluginPanel = Common.UI.BaseView.extend(_.extend({
        template: _.template([
            '<div class="current-plugin-box layout-ct vbox">',
                '<div class="current-plugin-frame">',
                '</div>',
                '<div class="current-plugin-header">',
                    '<div class="title">',
                        '<label></label>',
                        '<div class="custom-title"></div>',
                    '</div>',
                    '<div class="custom-controls">',
                        '<div class="left"></div>',
                        '<div class="right"></div>',
                    '</div>',
                    '<div class="tools">',
                        '<div class="more"></div>',
                        '<div class="plugin-hide"></div>',
                        '<div class="plugin-undock"></div>',
                        '<div class="plugin-close close"></div>',   
                    '</div>',
                '</div>',
            '</div>',
            '<div id="plugins-mask" style="display: none;">'
        ].join('')),

        initialize: function(options) {
            _.extend(this, options);
            this._state = {};
            if (!this.menu) {
                this.menu = 'left';
            }
            this.customControls = [];
            Common.UI.BaseView.prototype.initialize.call(this, arguments);
        },

        render: function(el) {
            const me = this;
            el && (this.$el = $(el));
            this.$el.html(this.template({scope: this}));

            /**
             * @type {Array<'close' | 'docked' | 'collapse'>}
             */
            let hiddenHeaderButtons = this.hiddenHeaderButtons;
            !Array.isArray(hiddenHeaderButtons) && (hiddenHeaderButtons = []);

            this.pluginsMask = $('#plugins-mask', this.$el);
            this.currentPluginPanel = $('.current-plugin-box', this.$el);
            this.currentPluginFrame = $('.current-plugin-frame', this.$el);

            if(!hiddenHeaderButtons.includes('close')) {
                this.pluginClose = new Common.UI.Button({
                    parentEl: this.$el.find('.plugin-close'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-close',
                    hint: this.textClosePanel
                });
            } else {
                this.$el.find('.plugin-close').remove();
            }

            this.btnMore = new Common.UI.Button({
                parentEl: this.$el.find('.more'),
                cls: 'btn-toolbar no-caret',
                iconCls: 'toolbar__icon btn-more',
                hint: this.textMore,
                enableToggle: true
            });
            this.btnMore.hide();
            this.btnMore.on('toggle', function(btn, state, e) {
                (state) ? me.onMoreShow() : me.onMoreHide();
            });
            const moreContainer = $('<div class="dropdown-menu more-container"><div class="inner"></div></div>');
            this.$el.find('.more').append(moreContainer);
            this.btnMore.$panel = moreContainer.find('.inner'); 

            if (this.sideMenuButton && !hiddenHeaderButtons.includes('collapse')) {
                this.pluginHide = new Common.UI.Button({
                    parentEl: this.$el.find('.plugin-hide'),
                    cls: 'btn-toolbar' + (this.menu==='right' ^ Common.UI.isRTL() ? ' icon-mirrored' : ''),
                    iconCls: 'toolbar__icon btn-panel-left-collapse',
                    hint: this.textHidePanel
                });
            } else {
                this.$el.find('.plugin-hide').remove();
            }

            if(this.isCanDocked && !hiddenHeaderButtons.includes('docked')) {
                this.btnUndock = new Common.UI.Button({
                    parentEl: this.$el.find('.plugin-undock'),
                    cls: 'btn-toolbar',
                    iconCls: 'toolbar__icon btn-unpin',
                    hint: this.textUndock
                });
                this.btnUndock.on('click', _.bind(function() {
                    this.fireEvent('docked', this.iframePlugin.id);
                }, this));
            } else {
                this.$el.find('.plugin-undock').remove();
            }

            Common.NotificationCenter.on({
                'layout:resizestop': function(e){
                    me.updateMoreMenu();
                    me.onMoreHide();
                },
                'window:resize': function() {
                    me.onMoreHide();
                }
            });

            this.trigger('render:after', this);
            this._rendered = true;
            return this;
        },

        addHeaderCustomControls: function(added, removed) {
            const me = this;
            let beenСhanges = false;

            if(Array.isArray(removed) && removed.length) {
                removed.forEach(function(cmp, index) {
                    const controlIndex = _.findIndex(me.customControls, {cmp: cmp});
                    if (controlIndex != -1) {
                        const customControl = me.customControls[controlIndex];
                        customControl.$elRef.remove();
                        customControl.$slot.remove();
                        me.customControls.splice(controlIndex, 1);
                    }
                });
                beenСhanges = true;
            }

            if(Array.isArray(added) && added.length) {
                added.forEach(function(cmp) {
                    let $parent; 
                    if(cmp.options.isTitle) {
                        $parent = $('.current-plugin-header .custom-title', me.$el);
                    }
                    else if(cmp.options.align == 'left') $parent = $('.custom-controls > .left', me.$el);
                    else if(cmp.options.align == 'right') $parent = $('.custom-controls > .right', me.$el);
        
                    if($parent) {
                        const $slot = $('<div></div>');
                        $slot.append(cmp.$el);
                        $parent.append($slot);
                        me.customControls.push({
                            $slot: $slot,
                            cmp: cmp,
                            $elRef: $slot.children().first(), 
                            align: cmp.options.align,
                            isTitle: !!cmp.options.isTitle
                        });
                    }     
                    if(cmp.menu) {
                        cmp.menu.on('show:after', function(menu, e) {
                            // Hide the "More" menu if another menu outside of it is being opened.
                            if(menu.el == e.target && !$.contains(me.btnMore.$panel[0], menu.el)) {
                                me.onMoreHide();
                            }
                        });
                    }
                });
                beenСhanges = true;
            }

            if(beenСhanges) {
                // Sort by opacity priority: right align buttons are hidden first
                me.customControls.sort(function(a, b) {
                    const order = function(item) {
                        if (item.isTitle) return 0;
                        else if (item.align === 'left') return 1;
                        return 2; // right
                    };
                    return order(a) - order(b);
                });
                me.customControls.reverse();
            }
            me.updateTitle();
            me.updateMoreMenu();
        },

        updateTitleMaxWidth: function() {
            const $header = this.$el.find('.current-plugin-header');
            const $title = $header.find('.title');
            const $tools = $header.find('.tools');
            const titleMargins = (parseFloat($title.css('margin-left')) || 0) + (parseFloat($title.css('margin-right')) || 0);
            $title.css('max-width', $header.width() - $tools.outerWidth(true) - titleMargins + 'px');
        },

        updateTitle: function() {
            if(this.customControls.some(function(el) { return el.isTitle })) {
                this.$el.find('.current-plugin-header .title label').hide();
                this.$el.find('.current-plugin-header .custom-plugin').show();
            } else {
                const label = (this.header && this.header.title) || this._labelName;
                this.$el.find('.current-plugin-header .title label').text(label).show();
                this.$el.find('.current-plugin-header .custom-plugin').hide();
            }
        },

        updateMoreMenu: function() {
            this.updateTitleMaxWidth();
            if (!this.customControls || this.customControls.length == 0) {
                this.btnMore.hide();
                return;
            }

            const me = this;
            const $header = this.$el.find('.current-plugin-header');

            // Put all the components back into their slots and display them.
            if (Array.isArray(this.customControls)) {
                this.customControls.forEach(function(item) {
                    item.$slot.show();
                    if (item.$elRef && item.$elRef.length && !$.contains(item.$slot[0], item.$elRef[0])) {
                        item.$slot.append(item.$elRef);
                    }
                });
            }
            this.btnMore.hide();

            // Calculate the total width of all direct children of the header.
            // If it exceeds the width of the header, there is an overflow.
            const isOverflowing = function() {
                let fullWidth = 0;
                $header.children().each(function() {
                    fullWidth += $(this).outerWidth(true);
                });
                return fullWidth - $header.width() > 0.1;
            };

            if (isOverflowing()) {
                this.btnMore.show();

                // Iterate through the customControls in order of hiding priority (right → left).
                // For each overflowing element: hide the slot wrapper and move $elRef to the "More" panel.
                for (let i = 0; i < this.customControls.length; i++) {
                    const item = this.customControls[i];
                    if(item.isTitle) continue;
                    if (!isOverflowing()) break;

                    if (item.$elRef && item.$elRef.length) {
                        item.$slot.hide();
                        me.btnMore.$panel.prepend(item.$elRef);
                    }
                }
                this.updateTitleMaxWidth();
            }
        },

        openInsideMode: function(name, url, frameId, guid) {
            if (!this._rendered) this.render();
            this._labelName = name;
            this.updateTitle();

            if (!this.iframePlugin) {
                this.iframePlugin = document.createElement("iframe");
                this.iframePlugin.id           = (frameId === undefined) ? 'plugin_iframe' : frameId;
                this.iframePlugin.name         = 'pluginFrameEditor';
                this.iframePlugin.width        = '100%';
                this.iframePlugin.height       = '100%';
                this.iframePlugin.align        = "top";
                this.iframePlugin.frameBorder  = 0;
                this.iframePlugin.scrolling    = "no";
                this.iframePlugin.allow = "camera; microphone; display-capture";
                this.iframePlugin.onload       = _.bind(this._onLoad,this);
                this.currentPluginFrame.append(this.iframePlugin);

                if (!this.loadMask)
                    this.loadMask = new Common.UI.LoadMask({owner: this.currentPluginFrame});
                this.loadMask.setTitle(this.textLoading);
                this.loadMask.show();

                this.iframePlugin.src = url;
            }
            this._state.insidePlugin = guid;
            return true;
        },

        closeInsideMode: function() {
            if (this.iframePlugin) {
                this.currentPluginFrame.empty();
                this.iframePlugin = null;
            }
            this._state.insidePlugin = undefined;
        },

        onMoreHide: function() {
            let moreContainer = this.btnMore.$panel.parent();
            if (this.btnMore.pressed) {
                this.btnMore.toggle(false, true);
            }
            if (moreContainer.is(':visible')) {
                moreContainer.hide();
            }
        },

        onMoreShow: function() {
            let moreContainer = this.btnMore.$panel.parent(),
                target = this.btnMore.$el,
                showxy = Common.Utils.getOffset(target),
                left = showxy.left,
                right = Common.Utils.innerWidth() - (showxy.left + target.width()),
                top = showxy.top + target.height() + 10;

            let styles = Common.UI.isRTL() ? 
                {left: left, right: 'auto', top : top, 'max-width': (Common.Utils.innerWidth() - left) + 'px'} : 
                {right: right, left: 'auto', top : top, 'max-width': (Common.Utils.innerWidth() - right) + 'px'};
            moreContainer.css(styles);
            moreContainer.show();
        },

        _onLoad: function() {
            if (this.loadMask)
                this.loadMask.hide();
        },

        hide: function () {
            Common.UI.BaseView.prototype.hide.call(this,arguments);
        },

        enablePointerEvents: function(enable) {
            this.iframePlugin && (this.iframePlugin.style.pointerEvents = enable ? "" : "none");
        },

        textClosePanel: 'Close plugin',
        textLoading: 'Loading',
        textUndock: 'Unpin plugin',
        textHidePanel: 'Collapse plugin',
        textMore: 'More',

    }, Common.Views.PluginPanel || {}));
});