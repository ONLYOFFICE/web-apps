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
            _options.cls += ' advanced-settings-dlg invisible-borders';
            (!_options.buttons || _.size(_options.buttons)<1) && (_options.cls += ' no-footer');
            _options.contentHeight = _options.height;
            _options.height = 'auto';

            this.template = [
                '<div id="id-plugin-container" class="box" style="height:' + _options.contentHeight + 'px;">',
                '<div id="id-plugin-placeholder" style="width: 100%;height: 100%;"></div>',
                '</div>',
                '<% if ((typeof buttons !== "undefined") && _.size(buttons) > 0) { %>',
                '<div class="separator horizontal"></div>',
                '<% } %>'
            ].join('');

            _options.tpl = _.template(this.template)(_options);

            this.url = options.url || '';
            this.loader = (options.loader!==undefined) ? options.loader : true;
            this.frameId = options.frameId || 'plugin_iframe';
            this.guid = options.guid;
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var bodyEl = this.$window.find('> .body');
            bodyEl.css({height: 'auto', overflow: 'hidden'});
            this.boxEl = this.$window.find('.body > .box');

            this._headerFooterHeight = this.options.header ? parseInt(this.$window.find('.header').css('height')) : 0;
            if (this.options.buttons && _.size(this.options.buttons)>0)
                this._headerFooterHeight += parseInt(this.$window.find('.footer').css('height')) + parseInt(bodyEl.css('padding-top')) + parseInt(bodyEl.css('padding-bottom'));
            this._headerFooterHeight += ((parseInt(this.$window.css('border-top-width')) + parseInt(this.$window.css('border-bottom-width'))));

            if (Common.Utils.innerHeight()-this.bordersOffset*2 < this.options.contentHeight + this._headerFooterHeight) {
                this.options.contentHeight = Common.Utils.innerHeight()-this.bordersOffset*2 - this._headerFooterHeight;
                this.boxEl.css('height', this.options.contentHeight);
            }

            this.$window.find('.header').prepend($('<div class="tools left hidden"></div>'));

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

            this.on('resizing', function(args){
                me.boxEl.css('height', parseInt(me.$window.css('height')) - me._headerFooterHeight);
            });

            var onMainWindowResize = function(){
                me.onWindowResize();
            };
            $(window).on('resize', onMainWindowResize);
            this.on('close', function() {
                $(window).off('resize', onMainWindowResize);
            });
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

            Common.UI.Window.prototype.setHeight.call(this, height + this._headerFooterHeight);
            Common.UI.Window.prototype.setWidth.call(this, width + borders_width);

            this.$window.css('left',(maxWidth - width - borders_width) / 2);
            this.$window.css('top',(maxHeight - height - this._headerFooterHeight) / 2);

            this._restoreHeight = this._restoreWidth = undefined;
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

        showButton: function(id, toRight) {
            var header = this.$window.find(toRight ? '.header .tools:not(.left)' : '.header .tools.left'),
                btn = header.find('#id-plugindlg-' + id);
            if (btn.length<1) {
                var iconCls = (id ==='back') ? 'btn-promote' : 'btn-' + Common.Utils.String.htmlEncode(id);
                btn = $('<div id="id-plugindlg-' + id + '" class="tool custom toolbar__icon ' + iconCls + '"></div>');
                btn.on('click', _.bind(function() {
                    this.fireEvent('header:click',id);
                }, this));
                header.append(btn);
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

        textLoading : 'Loading'
    }, Common.Views.PluginDlg || {}));
});