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
 * Date: 17.05.16
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([], function () {
    'use strict';

    Common.Views.PluginDlg = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var _options = {};
            _.extend(_options,  {
                header: true,
                enableKeyEvents: false,
                automove: false
            }, options);

            this.bordersOffset = 40;
            _options.width = (Common.Utils.innerWidth()-this.bordersOffset*2-_options.width)<0 ? Common.Utils.innerWidth()-this.bordersOffset*2: _options.width;
            _options.cls += ' advanced-settings-dlg invisible-borders plugin-dialog';
            (!_options.buttons || _.size(_options.buttons)<1) && (_options.cls += ' no-footer');
            _options.contentHeight = _options.height;
            _options.height = 'auto';

            this.templateHeader = [
                '<div class="header">',
                    '<div class="side-block left">',
                        '<div class="tools left"></div>',
                        '<div class="custom-controls left"></div>',
                    '</div>',
                    '<div class="title">',
                        '<label></label>',
                        '<div class="custom-title"></div>',
                    '</div>',
                    '<div class="side-block right">',
                        '<div class="custom-controls right"></div>',
                        '<div class="tools right">',
                            '<div class="more drag-ignore"></div>',
                            '<div>',
                                '<div class="plugin-dock drag-ignore tool custom toolbar__icon btn-pin"></div>',
                            '</div>',
                            '<div class="tool close"></div>',
                        '</div>',
                    '</div>',
                '</div>'
            ].join('');

            this.template = [
                '<div id="id-plugin-container" class="box" style="height:' + _options.contentHeight + 'px;">',
                '<div id="id-plugin-placeholder" style="width: 100%;height: 100%;"></div>',
                '</div>',
                '<% if ((typeof buttons !== "undefined") && _.size(buttons) > 0) { %>',
                '<div class="separator horizontal"></div>',
                '<% } %>'
            ].join('');

            _options.tplHeader = _.template(this.templateHeader)(_options);
            _options.tpl = _.template(this.template)(_options);

            this.url = options.url || '';
            this.loader = (options.loader!==undefined) ? options.loader : true;
            this.frameId = options.frameId || 'plugin_iframe';
            this.guid = options.guid;
            this.customControls = [];
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var bodyEl = this.$window.find('> .body');
            bodyEl.css({height: 'auto', overflow: 'hidden'});
            this.boxEl = this.$window.find('.body > .box');

            /**
             * @type {{ close?: boolean, docked?: boolean, collapse?: boolean }}
             */
            const hideHeaderButtons = this.options.hideHeaderDefaultButtons;

            this._headerFooterHeight = this.options.header ? parseInt(this.$window.find('.header').css('height')) : 0;
            if (this.options.buttons && _.size(this.options.buttons)>0)
                this._headerFooterHeight += parseInt(this.$window.find('.footer').css('height')) + parseInt(bodyEl.css('padding-top')) + parseInt(bodyEl.css('padding-bottom'));
            this._headerFooterHeight += ((parseInt(this.$window.css('border-top-width')) + parseInt(this.$window.css('border-bottom-width'))));

            if (Common.Utils.innerHeight()-this.bordersOffset*2 < this.options.contentHeight + this._headerFooterHeight) {
                this._restoreHeight = this.options.contentHeight + this._headerFooterHeight;
                this.options.contentHeight = Common.Utils.innerHeight()-this.bordersOffset*2 - this._headerFooterHeight;
                this.boxEl.css('height', this.options.contentHeight);
            }

            if(hideHeaderButtons && hideHeaderButtons.close === true) {
                this.$window.find('.header .close').remove();
            }

            this.btnMore = new Common.UI.Button({
                parentEl: this.$window.find('.more'),
                cls: 'btn-toolbar no-focus',
                iconCls: 'toolbar__icon btn-more',
                hint: this.textMore,
                enableToggle: true
            });
            this.btnMore.hide();
            this.btnMore.on('toggle', function(btn, state, e) {
                (state) ? me.onMoreShow() : me.onMoreHide();
            });
            const moreContainer = $('<div class="dropdown-menu more-container"><div class="inner"></div></div>');
            this.$window.find('.more').append(moreContainer);
            this.btnMore.$panel = moreContainer.find('.inner'); 

            var iframe = document.createElement("iframe");
            iframe.id           = this.frameId;
            iframe.name         = 'pluginFrameEditor';
            iframe.width        = '100%';
            iframe.height       = '100%';
            iframe.align        = "top";
            iframe.frameBorder  = 0;
            iframe.scrolling    = "no";
            iframe.allow = "camera; microphone; display-capture";
            iframe.onload       = _.bind(this._onLoad,this);

            var me = this;
            var pholder = this.$window.find('#id-plugin-placeholder');
            if (this.loader) {
                setTimeout(function(){
                    if (me.isLoaded) return;
                    me.loadMask = new Common.UI.LoadMask({owner: pholder});
                    me.loadMask.setTitle(me.textLoading);
                    me.loadMask.show();
                    if (me.isLoaded) me.loadMask.hide();
                }, 500);
            }

            iframe.src = this.url;
            pholder.append(iframe);
            this.frame = iframe;
            this.on('resizing', function(args){
                me.boxEl.css('height', parseInt(me.$window.css('height')) - me._headerFooterHeight);
            });

            var onMainWindowResize = function(){
                me.onWindowResize();
                me.onMoreHide();
            };
            $(window).on('resize', onMainWindowResize);
            this.on('close', function() {
                $(window).off('resize', onMainWindowResize);
            });

            this.on('resizing', function() {
                me.updateMoreMenu();
                me.onMoreHide();
            });

            this.on('drag', function() {
                me.onMoreHide();
            });

            if(this.options.isCanDocked && !(hideHeaderButtons && hideHeaderButtons.docked == true)) {
                this.showDockedButton();
            } else {
                this.$window.find('.plugin-dock').parent().remove();
            }

            this.updateTitle();
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
                        $parent = $('.header .custom-title', me.$window);
                    }
                    else if(cmp.options.align == 'left') $parent = $('.side-block.left .custom-controls', me.$window);
                    else if(cmp.options.align == 'right') $parent = $('.side-block.right .custom-controls', me.$window);
        
                    if($parent) {
                        const $slot = $('<div class="drag-ignore"></div>');
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
            const $header = this.$window.find('.header');
            const $title = $header.find('.title');
            const $tools = $header.find('.tools');
            const titleMargins = (parseFloat($title.css('margin-left')) || 0) + (parseFloat($title.css('margin-right')) || 0);
            const toolsWidths = $tools.map(function() {
                return $(this).outerWidth(true);
            }).get();

            var maxToolsWidth = Math.max.apply(Math, toolsWidths);
            $title.css('max-width', $header.width() - (maxToolsWidth * 2) - titleMargins + 'px');
        },

        updateTitle: function() {
            if(this.customControls.some(function(el) { return el.isTitle })) {
                this.$window.find('.header label').hide();
                this.$window.find('.header .custom-plugin').show();
            } else {
                const label = (this.header && this.header.title) || this.options.title;
                this.$window.find('.header label').text(label).show();
                this.$window.find('.header .custom-plugin').hide();
            }
            this.updateTitleMaxWidth();
        },

        updateMoreMenu: function() {
            if (!this.customControls || this.customControls.length == 0) {
                this.btnMore.hide();
                return;
            }

            const me = this;
            const $header = this.$window.find('.header');
            let showMore = false;

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
            const isOverflowing = function($parent) {
                let fullWidth = 0;
                $parent.children().each(function() {
                    fullWidth += $(this).outerWidth(true);
                });
                return fullWidth - $parent.width() > 0.1;
            };

            me.btnMore.show();
            const groupedControls = _.groupBy(me.customControls, 'align');
            ['right', 'left'].forEach(function(align) {
                const $sideBlock = $header.find('.side-block' + '.' + align);
                if(groupedControls[align] && $sideBlock && isOverflowing($sideBlock)) {
                    showMore = true;
                    for (let i = 0; i < groupedControls[align].length; i++) {
                        const item = groupedControls[align][i];
                        if(item.isTitle) continue;
                        if (!isOverflowing($sideBlock)) break;

                        if (item.$elRef && item.$elRef.length) {
                            item.$slot.hide();
                            me.btnMore.$panel.prepend(item.$elRef);
                        }
                    }
                }
            });
            me.btnMore[showMore ? 'show' : 'hide']();

            this.updateTitleMaxWidth();
        },

        _onLoad: function() {
            this.isLoaded = true;
            if (this.loadMask)
                this.loadMask.hide();
        },

        setInnerSize: function(width, height) {
            var maxHeight = Common.Utils.innerHeight(),
                maxWidth = Common.Utils.innerWidth(),
                borders_width = (parseInt(this.$window.css('border-left-width')) + parseInt(this.$window.css('border-right-width'))),
                bordersOffset = this.bordersOffset*2;
            if (maxHeight - bordersOffset<height + this._headerFooterHeight)
                height = maxHeight - bordersOffset - this._headerFooterHeight;
            if (maxWidth - bordersOffset<width + borders_width)
                width = maxWidth - bordersOffset - borders_width;

            this.boxEl.css('height', height);

            let offset_x = (width - this.getWidth())/2,
                offset_y = (height - this.getHeight() + this._headerFooterHeight)/2;

            Common.UI.Window.prototype.setHeight.call(this, height + this._headerFooterHeight);
            Common.UI.Window.prototype.setWidth.call(this, width + borders_width);

            const curr_left = this.getLeft(),
                curr_top = this.getTop();
            if (curr_left + width + borders_width > maxWidth)
                offset_x = Math.max(0, maxWidth - width - borders_width - this.bordersOffset);
            else if (curr_left - offset_x < 0)
                offset_x = 0;
            else offset_x = curr_left - offset_x;

            if (curr_top + height + this._headerFooterHeight > maxHeight)
                offset_y = Math.max(0, maxHeight - height - this._headerFooterHeight - this.bordersOffset);
            else if (curr_top - offset_y < Common.Utils.InternalSettings.get('window-inactive-area-top'))
                offset_y = Common.Utils.InternalSettings.get('window-inactive-area-top');
            else offset_y = curr_top - offset_y;

            this.$window.css({'left': offset_x, 'top': offset_y});
            this._restoreHeight = this._restoreWidth = undefined;
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
                top = showxy.top + target.height() + 2;

            let styles = Common.UI.isRTL() ? 
                {left: left, right: 'auto', top : top, 'max-width': (Common.Utils.innerWidth() - left) + 'px'} : 
                {right: right, left: 'auto', top : top, 'max-width': (Common.Utils.innerWidth() - right) + 'px'};
            moreContainer.css(styles);
            moreContainer.show();
        },

        onWindowResize: function() {
            var main_width  = Common.Utils.innerWidth(),
                main_height = Common.Utils.innerHeight(),
                win_width = this.getWidth(),
                win_height = this.getHeight(),
                bordersOffset = (this.resizable) ? 0 : this.bordersOffset;
            if (win_height<main_height-bordersOffset*2+0.1 ) {
                if (!this.resizable && this._restoreHeight>0 && win_height < this._restoreHeight) {
                    var height = Math.max(Math.min(this._restoreHeight, main_height-bordersOffset*2), this.initConfig.minheight);
                    this.setHeight(height);
                    this.boxEl.css('height', height - this._headerFooterHeight);
                }
                var top = this.getTop();
                if (top<bordersOffset) this.$window.css('top', bordersOffset);
                else if (top+win_height>main_height-bordersOffset)
                    this.$window.css('top', main_height-bordersOffset - win_height);
            } else {
                if (this._restoreHeight===undefined) {
                    this._restoreHeight = win_height;
                }
                this.setHeight(Math.max(main_height-bordersOffset*2, this.initConfig.minheight));
                this.boxEl.css('height', Math.max(main_height-bordersOffset*2, this.initConfig.minheight) - this._headerFooterHeight);
                this.$window.css('top', bordersOffset);
            }
            if (win_width<main_width-bordersOffset*2+0.1) {
                if (!this.resizable && this._restoreWidth>0 && win_width < this._restoreWidth) {
                    this.setWidth(Math.max(Math.min(this._restoreWidth, main_width-bordersOffset*2), this.initConfig.minwidth));
                }
                var left = this.getLeft();
                if (left<bordersOffset) this.$window.css('left', bordersOffset);
                else if (left+win_width>main_width-bordersOffset)
                    this.$window.css('left', main_width-bordersOffset-win_width);
            } else {
                if (this._restoreWidth===undefined) {
                    this._restoreWidth = win_width;
                }
                this.setWidth(Math.max(main_width-bordersOffset*2, this.initConfig.minwidth));
                this.$window.css('left', bordersOffset);
            }
        },

        onThemeChanged: function() {
            this.updateMoreMenu();
            Common.UI.Window.prototype.onThemeChanged.call(this);
        },

        showDockedButton: function() {
            var header = this.$window.find('.header .tools:not(.left)'),
                // header = this.$window.find('.header .tools.left'),
                btn = header.find('.plugin-dock');
            if (!this._dockedTipInit) {
                btn.on('click', _.bind(function() {
                    var tip = btn.data('bs.tooltip');
                    if (tip) tip.dontShow = true;
                    this.fireEvent('docked', this.frameId);
                }, this));
                btn.tooltip({title: this.textDock, placement: 'cursor', zIndex: parseInt(this.$window.css('z-index')) + 10});
                this._dockedTipInit = true;
            }
            btn.show();
            header.removeClass('hidden');
        },

        showButton: function(id, toRight) {
            var header = this.$window.find(toRight ? '.header .tools:not(.left)' : '.header .tools.left'),
                btn = header.find('#id-plugindlg-' + id);
            if (btn.length<1) {
                var iconCls = (id ==='back') ? 'btn-promote' : 'btn-' + Common.Utils.String.htmlEncode(id);
                btn = $('<div id="id-plugindlg-' + id + '" class="tool custom toolbar__icon ' + iconCls + '"></div>');
                btn.on('click', _.bind(function() {
                    this.fireEvent('header:click',id);
                }, this));
                const more = header.find('.more');
                if (more.length > 0) {
                    btn.insertAfter(more);
                } else {
                    header.prepend(btn);
                }
            }
            btn.show();
            header.removeClass('hidden');
        },

        hideButton: function(id) {
            var btn = this.$window.find('.header #id-plugindlg-' + id);
            if (btn.length>0) {
                btn.hide();
            }
        },

        enablePointerEvents: function(enable) {
            this.frame && (this.frame.style.pointerEvents = enable ? "" : "none");
        },

        textLoading : 'Loading',
        textDock: 'Pin plugin',
        textMore: 'More'
    }, Common.Views.PluginDlg || {}));
});