/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *    Window.js
 *
 *    Created by Maxim Kadushkin on 24 January 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

/*
 *      Usage
 *
 *      Configuration
 *
 *      @cfg {Boolean} closable
 *      Doesn't allow user to close window neither ESC nor the 'close' button.
 *
 *      @cfg {Boolean} header
 *      Prevents window to create header. Default value is 'true'

 *      @cfg {Boolean} modal
 *      False if window will not allowed to take over keyboard and mouse input.
 *
 *      @cfg {String} title
 *
 *      @cfg {String} tpl
 *      Describes template of window's body
 *
 *      @cfg {String} cls
 *      Extra class for the root dom-element
 *
 *      @cfg {Boolean} animate
 *      Makes the window to animate while showing or hiding
 *
 *      Methods
 *
 *      @method show
 *      Fires event 'afterender'
 *
 *      @method close
 *      Fires event 'close'
 *
 *      @method setSize
 *      Sets new size of the window
 *      @params {Integer} width
 *      @params {Integer} height

 *      @method getSize
 *      Returns current size of the window
 *      @returns {Array} [width, height]
 *
 *      @method getChild
 *      @params {String} selector
 *
 *
 *      Events
 *
 *      @event close
 *
 *      @event afterender
 *
 *      Examples
 *      var win = new Common.UI.Window({
 *           title: options.title,
 *           tpl: template
 *      });
 *
 *      win.on('close', onClose);
 *      win.show()
 *
 *
 *      ****************************************
 *      Extends
 *
 *      @window Common.UI.warning
 *      Shows warning message.
 *      @cfg {String} msg
 *      @cfg {Object} buttons
 *          Use an array for predefined buttons (ok, cancel, yes, no): @example ['yes', 'no']
 *          Use a named array for the custom buttons: {value: caption, ...}
 *              @param {String} value will be returned in callback function
 *              @param {String} caption
 *
 *      @cfg {Function} callback
 *      @param {String} button
 *      If the window is closed via shortcut or header's close tool, the 'button' will be 'close'
 *
 *      @example
 *      Common.UI.warning({
 *           msg: 'Unknown error.',
 *           buttons: ['ok'],
 *           callback: function(btn) {
 *               console.log('button was pressed: ' + btn);
 *           }
 *       });
 *
 *
 *      @window Common.UI.error
 *      @window Common.UI.info
 *      @window Common.UI.confirm
 *
 */

 if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView'
], function () {
    'use strict';

    Common.UI.Window = Common.UI.BaseView.extend(_.extend((function(){
        var config = {
                closable:   true,
                header:     true,
                modal:      true,
                width:      'auto',
                height:     'auto',
                title:      'Title',
                alias:      'Window',
                cls:        '',
                toolclose:  'close',
                maxwidth: undefined,
                maxheight: undefined,
                minwidth: 0,
                minheight: 0,
                enableKeyEvents: true
        };

        var template = '<div class="asc-window<%= modal?" modal":"" %><%= cls?" "+cls:"" %>" id="<%= id %>" style="width:<%= width %>px;">' +
                            '<% if (header==true) { %>' +
                                '<div class="header">' +
                                    '<% if (closable!==false) %>' +
                                        '<div class="tool close img-commonctrl"></div>' +
                                    '<% %>' +
                                    '<span class="title"><%= title %></span> ' +
                                '</div>' +
                            '<% } %>' +
                            '<div class="body"><%= tpl %></div>' +
                        '</div>';

        function _getMask() {
            var mask = $('.modals-mask');

            if( mask.length == 0) {
                mask = $("<div class='modals-mask'>")
                    .appendTo(document.body).hide();
                mask.attr('counter', 0);
            }

            return mask;
        }

        function _keydown(event) {
            if (!this.isLocked() && this.isVisible()
                        && this.initConfig.enableKeyEvents && this.pauseKeyEvents !== false) {
                switch (event.keyCode) {
                    case Common.UI.Keys.ESC:
                        if ( $('.asc-loadmask').length<1 ) {
                            event.preventDefault();
                            event.stopPropagation();
                            if (this.initConfig.closable !== false) {
                                if (this.initConfig.toolcallback)
                                    this.initConfig.toolcallback.call(this);
                                else
                                    (this.initConfig.toolclose=='hide') ? this.hide() : this.close();
                            }
                            return false;
                        }
                        break;
                    case Common.UI.Keys.RETURN:
                        if (this.$window.find('.btn.primary').length && $('.asc-loadmask').length<1) {
                            if ((this.initConfig.onprimary || this.onPrimary).call(this)===false) {
                                event.preventDefault();
                                return false;
                            }
                        }
                        break;
                }
            }
        }

        function _centre() {
            if (window.innerHeight == undefined) {
                var main_width  = document.documentElement.offsetWidth;
                var main_height = document.documentElement.offsetHeight;
            } else {
                main_width  = Common.Utils.innerWidth();
                main_height = Common.Utils.innerHeight();
            }

            if (this.initConfig.height == 'auto') {
                var win_height = parseInt(this.$window.find('.body').css('height'));
                this.initConfig.header && (win_height += parseInt(this.$window.find('.header').css('height')));
            } else
                win_height = this.initConfig.height;

            var win_width = (this.initConfig.width=='auto') ? parseInt(this.$window.find('.body').css('width')) : this.initConfig.width;
            
            var top  = Math.floor((parseInt(main_height) - parseInt(win_height)) / 2);
            var left = Math.floor((parseInt(main_width) - parseInt(win_width)) / 2);

            this.$window.css('left',left);
            this.$window.css('top',top);
        }

        function _setVisible() {
            if (window.innerHeight == undefined) {
                var main_width  = document.documentElement.offsetWidth;
                var main_height = document.documentElement.offsetHeight;
            } else {
                main_width  = Common.Utils.innerWidth();
                main_height = Common.Utils.innerHeight();
            }

            if (this.getLeft() + this.getWidth() > main_width)
                this.$window.css('left', main_width - this.getWidth());
            if (this.getTop() + this.getHeight() > main_height)
                this.$window.css('top', main_height - this.getHeight());
        }

        function _getTransformation(end) {
            return {
                '-webkit-transition': '0.3s opacity',
                '-moz-transition': '0.3s opacity',
                '-ms-transition': '0.3s opacity',
                '-o-transition': '0.3s opacity',
                'opacity': end
            }
        }

        /* window drag's functions */
        function _dragstart(event) {
            if ( $(event.target).hasClass('close') ) return;
            Common.UI.Menu.Manager.hideAll();
            var zoom = (event instanceof jQuery.Event) ? Common.Utils.zoom() : 1;
            this.dragging.enabled = true;
            this.dragging.initx = event.pageX*zoom - this.getLeft();
            this.dragging.inity = event.pageY*zoom - this.getTop();

            if (window.innerHeight == undefined) {
                var main_width  = document.documentElement.offsetWidth;
                var main_height = document.documentElement.offsetHeight;
            } else {
                main_width  = Common.Utils.innerWidth();
                main_height = Common.Utils.innerHeight();
            }

            this.dragging.maxx  = main_width - this.getWidth();
            this.dragging.maxy  = main_height - this.getHeight();

            $(document).on('mousemove', this.binding.drag);
            $(document).on('mouseup', this.binding.dragStop);

            this.fireEvent('drag', [this, 'start']);

//            event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
//            event.preventDefault && event.preventDefault();

//            return false;
        }

        function _mouseup() {
            $(document).off('mousemove', this.binding.drag);
            $(document).off('mouseup', this.binding.dragStop);

            this.dragging.enabled = false;
            this.fireEvent('drag', [this, 'end']);
        }

        function _mousemove(event) {
            if (this.dragging.enabled) {
                var zoom = (event instanceof jQuery.Event) ? Common.Utils.zoom() : 1,
                    left    = event.pageX*zoom - this.dragging.initx,
                    top     = event.pageY*zoom - this.dragging.inity;

                left < 0 ? (left = 0) : left > this.dragging.maxx && (left = this.dragging.maxx);
                top < 0 ? (top = 0) : top > this.dragging.maxy && (top = this.dragging.maxy);

                this.$window.css({left: left, top: top});
            }
        }

        function _onProcessMouse(data) {
            if (data.type == 'mouseup' && this.dragging.enabled) {
                _mouseup.call(this);
            }
        }


        /* window resize functions */
        function _resizestart(event) {
            Common.UI.Menu.Manager.hideAll();
            var el = $(event.target),
                left = this.getLeft(),
                top = this.getTop();

            this.resizing.enabled = true;
            this.resizing.initpage_x = event.pageX*Common.Utils.zoom();
            this.resizing.initpage_y = event.pageY*Common.Utils.zoom();
            this.resizing.initx = this.resizing.initpage_x - left;
            this.resizing.inity = this.resizing.initpage_y - top;
            this.resizing.initw = this.getWidth();
            this.resizing.inith = this.getHeight();
            this.resizing.type = [el.hasClass('left') ? -1 : (el.hasClass('right') ? 1 : 0), el.hasClass('top') ? -1 : (el.hasClass('bottom') ? 1 : 0)];

            var main_width  = (window.innerHeight == undefined) ? document.documentElement.offsetWidth : Common.Utils.innerWidth(),
                main_height = (window.innerHeight == undefined) ? document.documentElement.offsetHeight : Common.Utils.innerHeight(),
                maxwidth = (this.initConfig.maxwidth) ? this.initConfig.maxwidth : main_width,
                maxheight = (this.initConfig.maxheight) ? this.initConfig.maxheight : main_height;

            if (this.resizing.type[0]>0) {
                this.resizing.maxx  = Math.min(main_width, left+maxwidth);
                this.resizing.minx  = left+this.initConfig.minwidth;
            } else if (this.resizing.type[0]<0) {
                this.resizing.maxx  = left+this.resizing.initw-this.initConfig.minwidth;
                this.resizing.minx  = Math.max(0, left+this.resizing.initw-maxwidth);
            }
            if (this.resizing.type[1]>0) {
                this.resizing.maxy  = Math.min(main_height, top+maxheight);
                this.resizing.miny  = top+this.initConfig.minheight;
            } else if (this.resizing.type[1]<0) {
                this.resizing.maxy  = top+this.resizing.inith-this.initConfig.minheight;
                this.resizing.miny  = Math.max(0, top+this.resizing.inith-maxheight);
            }

            $(document.body).css('cursor', el.css('cursor'));
            this.$window.find('.resize-border').addClass('resizing');
            this.$window.find('.header').addClass('resizing');

            $(document).on('mousemove', this.binding.resize);
            $(document).on('mouseup', this.binding.resizeStop);
            this.fireEvent('resize', [this, 'start']);
        }

        function _resize(event) {
            if (this.resizing.enabled) {
                var resized = false,
                    zoom = (event instanceof jQuery.Event) ? Common.Utils.zoom() : 1,
                    pageX = event.pageX*zoom,
                    pageY = event.pageY*zoom;
                if (this.resizing.type[0] && pageX<this.resizing.maxx && pageX>this.resizing.minx) {
                    if (this.resizing.type[0]<0)
                        this.$window.css({left: pageX - this.resizing.initx});
                    this.setWidth(this.resizing.initw + (pageX - this.resizing.initpage_x) * this.resizing.type[0]);
                    resized = true;
                }
                if (this.resizing.type[1] && pageY<this.resizing.maxy && pageY>this.resizing.miny) {
                    if (this.resizing.type[1]<0)
                        this.$window.css({top: pageY - this.resizing.inity});
                    this.setHeight(this.resizing.inith + (pageY - this.resizing.initpage_y) * this.resizing.type[1]);
                    resized = true;
                }
                if (resized) this.fireEvent('resizing');
            }
        }

        function _resizestop() {
            $(document).off('mousemove', this.binding.resize);
            $(document).off('mouseup', this.binding.resizeStop);
            $(document.body).css('cursor', 'auto');
            this.$window.find('.resize-border').removeClass('resizing');
            this.$window.find('.header').removeClass('resizing');

            this.resizing.enabled = false;
            this.fireEvent('resize', [this, 'end']);
        }

        Common.UI.alert = function(options) {
            var me = this.Window.prototype;
            var arrBtns = {ok: me.okButtonText, cancel: me.cancelButtonText,
                yes: me.yesButtonText, no: me.noButtonText,
                close: me.closeButtonText};

            if (!options.buttons) {
                options.buttons = {};
                options.buttons['ok'] = {text: arrBtns['ok'], cls: 'primary'};
            } else {
                if (_.isArray(options.buttons)) {
                    if (options.primary==undefined)
                        options.primary = 'ok';
                    var newBtns = {};
                    _.each(options.buttons, function(b){
                        if (typeof(b) == 'object') {
                            if (b.value !== undefined)
                                newBtns[b.value] = {text: b.caption, cls: 'custom' + ((b.primary || options.primary==b.value) ? ' primary' : '')};
                        } else {
                            newBtns[b] = {text: (b=='custom') ? options.customButtonText : arrBtns[b], cls: (options.primary==b) ? 'primary' : ''};
                            if (b=='custom')
                                newBtns[b].cls += ' custom';
                        }
                    });

                    options.buttons = newBtns;
                }
            }
            options.dontshow = options.dontshow || false;

            if (!options.width) options.width = 'auto';
            
            var template =  '<div class="info-box">' +
                                '<% if (typeof iconCls !== "undefined") { %><div class="icon img-commonctrl <%= iconCls %>" /><% } %>' +
                                '<div class="text" <% if (typeof iconCls == "undefined") { %> style="padding-left:10px;" <% } %>><span><%= msg %></span>' +
                                    '<% if (dontshow) { %><div class="dont-show-checkbox"></div><% } %>' +
                                '</div>' +
                            '</div>' +
                            '<% if (dontshow) { %><div class="separator horizontal" style="width: 100%;"/><% } %>' +
                            '<% if (_.size(buttons) > 0) { %>' +
                                '<div class="footer <% if (dontshow) { %> dontshow <% } %>">' +
                                    '<% for(var bt in buttons) { %>' +
                                        '<button class="btn normal dlg-btn <%= buttons[bt].cls %>" result="<%= bt %>"><%= buttons[bt].text %></button>'+
                                    '<% } %>' +
                                '</div>' +
                            '<% } %>';

            _.extend(options, {
                cls: 'alert',
                onprimary: onKeyDown,
                tpl: _.template(template)(options)
            });

            var win = new Common.UI.Window(options),
               chDontShow = null;

            function autoSize(window) {
                var text_cnt    = window.getChild('.info-box');
                var text        = window.getChild('.info-box span');
                var footer      = window.getChild('.footer');
                var header      = window.getChild('.header');
                var body        = window.getChild('.body');
                var icon        = window.getChild('.icon'),
                    icon_height = (icon.length>0) ? icon.height() : 0;
                var check       = window.getChild('.info-box .dont-show-checkbox');

                if (!options.dontshow) body.css('padding-bottom', '10px');

                if (options.maxwidth && options.width=='auto') {
                    if ((text.position().left + text.width() + parseInt(text_cnt.css('padding-right'))) > options.maxwidth)
                        options.width = options.maxwidth;
                }
                if (options.width=='auto') {
                    text_cnt.height(Math.max(text.height() + ((check.length>0) ? (check.height() + parseInt(check.css('margin-top'))) : 0), icon_height));
                    body.height(parseInt(text_cnt.css('height')) + parseInt(footer.css('height')));
                    window.setSize(text.position().left + text.width() + parseInt(text_cnt.css('padding-right')),
                        parseInt(body.css('height')) + parseInt(header.css('height')));
                } else {
                    text.css('white-space', 'normal');
                    window.setWidth(options.width);
                    text_cnt.height(Math.max(text.height() + ((check.length>0) ? (check.height() + parseInt(check.css('margin-top'))) : 0), icon_height));
                    body.height(parseInt(text_cnt.css('height')) + parseInt(footer.css('height')));
                    window.setHeight(parseInt(body.css('height')) + parseInt(header.css('height')));
                }
                if (text.height() < icon_height-10)
                    text.css({'vertical-align': 'baseline', 'line-height': icon_height+'px'});
            }

            function onBtnClick(event) {
                if (options.callback) {
                    options.callback.call(win, event.currentTarget.attributes['result'].value, (chDontShow) ? (chDontShow.getValue() == 'checked') : false);
                }

                win.close(true);
            }

            function onKeyDown(event) {
                onBtnClick({currentTarget: win.getChild('.footer .dlg-btn')[0]});
                return false;
            }

            win.on({
                'render:after': function(obj){
                    obj.getChild('.footer .dlg-btn').on('click', onBtnClick);
                    chDontShow = new Common.UI.CheckBox({
                        el: win.$window.find('.dont-show-checkbox'),
                        labelText: win.textDontShow
                    });
                    autoSize(obj);
                },
                show: function(obj) {
                    obj.getChild('.footer .dlg-btn').focus();
                },
                close: function() {
                    options.callback && options.callback.call(win, 'close');
                }
            });

            win.show();
        };

        Common.UI.error = function(options) {
            options = options || {};
            !options.title && (options.title = this.Window.prototype.textError);

            Common.UI.alert(
                _.extend(options, {
                    iconCls: 'error'
                })
            );
        };

        Common.UI.confirm = function(options) {
            options = options || {};
            !options.title && (options.title = this.Window.prototype.textConfirmation);

            Common.UI.alert(
                _.extend(options, {
                    iconCls: 'confirm'
                })
            );
        };

        Common.UI.info = function(options) {
            options = options || {};
            !options.title && (options.title = this.Window.prototype.textInformation);

            Common.UI.alert(
                _.extend(options, {
                    iconCls: 'info'
                })
            );
        };

        Common.UI.warning = function(options) {
            options = options || {};
            !options.title && (options.title = this.Window.prototype.textWarning);

            Common.UI.alert(
                _.extend(options, {
                    iconCls: 'warn'
                })
            );
        };

        return {
            $window     : undefined,
            $lastmodal  : undefined,
            dragging    : {enabled: false},
            resizing    : {enabled: false},

            initialize : function(options) {
                this.initConfig = {};
                this.binding = {};

                _.extend(this.initConfig, config, options || {});

                !this.initConfig.id && (this.initConfig.id = 'window-' + this.cid);
                !this.initConfig.tpl && (this.initConfig.tpl = '');

                Common.UI.BaseView.prototype.initialize.call(this, this.initConfig);
            },

            render : function() {
                var renderto = this.initConfig.renderTo || document.body;
                $(renderto).append(
                    _.template(template)(this.initConfig)
                );

                this.$window = $('#' + this.initConfig.id);

                this.binding.keydown = _.bind(_keydown,this);
               // $(document).on('keydown', this.binding.keydown);

                if ( this.initConfig.header ) {
                    this.binding.drag         = _.bind(_mousemove, this);
                    this.binding.dragStop     = _.bind(_mouseup, this);
                    this.binding.dragStart    = _.bind(_dragstart, this);

                    var doclose = function() {
                        if ( this.$window.find('.tool.close').hasClass('disabled') ) return;
                        if (this.initConfig.toolcallback)
                            this.initConfig.toolcallback.call(this);
                        else
                            (this.initConfig.toolclose=='hide') ? this.hide() : this.close();
                    };
                    this.$window.find('.header').on('mousedown', this.binding.dragStart);
                    this.$window.find('.tool.close').on('click', _.bind(doclose, this));

                    if (!this.initConfig.modal)
                        Common.Gateway.on('processmouse', _.bind(_onProcessMouse, this));
                } else {
                    this.$window.find('.body').css({
                        top:0,
                        'border-radius': '5px'
                    });
                }

                if (this.initConfig.height == 'auto') {
                    var height = parseInt(this.$window.find('> .body').css('height'));
                    this.initConfig.header && (height += parseInt(this.$window.find('> .header').css('height')));
                    this.$window.height(height);
                } else {
                    this.$window.css('height',this.initConfig.height);
                }

                if (this.initConfig.resizable)
                    this.setResizable(this.initConfig.resizable);

                var me = this;
                this.binding.winclose = function(obj) {
                    if (me.$window && me.isVisible() && me.$window == obj.$window) me.close();
                };
                Common.NotificationCenter.on('window:close', this.binding.winclose);

                this.fireEvent('render:after',this);
                return this;
            },

            show: function(x,y) {
                if (this.initConfig.modal) {
                    var mask = _getMask();
                    if (this.options.animate !== false) {
                        var opacity = mask.css('opacity');
                        mask.css('opacity', 0);
                        mask.attr('counter', parseInt(mask.attr('counter'))+1);
                        mask.show();

                        setTimeout(function () {
                            mask.css(_getTransformation(opacity));
                        }, 1);
                    } else {
                        mask.attr('counter', parseInt(mask.attr('counter'))+1);
                        mask.show();
                    }

                    Common.NotificationCenter.trigger('modal:show', this);
                    this.$lastmodal = $('.asc-window.modal:not(.dethrone):visible').first().addClass('dethrone');
                }

                if (!this.$window) {
                    this.render();

                    if (_.isNumber(x) && _.isNumber(y)) {
                        this.$window.css('left',Math.floor(x));
                        this.$window.css('top',Math.floor(y));
                    } else
                        _centre.call(this);
                } else
                if (!this.$window.is(':visible')) {
                    this.$window.css({opacity: 0});
                    _setVisible.call(this);
                    this.$window.show()
                }

                $(document).on('keydown.' + this.cid, this.binding.keydown);

                var me = this;

                setTimeout(function () {
                    me.fireEvent('animate:before', me);
                }, 10);

                if (this.options.animate !== false) {
                    this.$window.css({
                        '-webkit-transform': 'scale(0.8)',
                        '-moz-transform': 'scale(0.8)',
                        '-ms-transform': 'scale(0.8)',
                        '-o-transform': 'scale(0.8)',
                        opacity: 0
                    });

                    setTimeout(function () {
                        me.$window.css({
                            '-webkit-transition': '0.2s opacity, 0.2s -webkit-transform',
                            '-webkit-transform': 'scale(1)',
                            '-moz-transition': '0.2s opacity, 0.2s -moz-transform',
                            '-moz-transform': 'scale(1)',
                            '-ms-transition': '0.2s opacity, 0.2s -ms-transform',
                            '-ms-transform': 'scale(1)',
                            '-o-transition': '0.2s opacity, 0.2s -o-transform',
                            '-o-transform': 'scale(1)',
                            'opacity': '1'
                        });
                    }, 1);

                    setTimeout(function () {
                        me.$window.addClass('notransform');
                        me.fireEvent('show', me);
                    }, (this.initConfig.modal) ? 1000 : 350);
                } else {
                    this.$window.css({opacity: 1});
                    this.$window.addClass('notransform');
                    this.fireEvent('show', this);
                }

                Common.NotificationCenter.trigger('window:show');
            },

            close: function(suppressevent) {
                $(document).off('keydown.' + this.cid);
                if ( this.initConfig.header ) {
                    this.$window.find('.header').off('mousedown', this.binding.dragStart);
                }
                Common.NotificationCenter.off({'window:close': this.binding.winclose});

                if (this.initConfig.modal) {
                    var mask = _getMask(),
                        hide_mask = true;
                    mask.attr('counter', parseInt(mask.attr('counter'))-1);

                    if (this.$lastmodal.length > 0) {
                        this.$lastmodal.removeClass('dethrone');
                        hide_mask = !(this.$lastmodal.hasClass('modal') && this.$lastmodal.is(':visible'));
                    }

                    if ( hide_mask ) {
                        if (this.options.animate !== false) {
                            var opacity = mask.css('opacity');
                            mask.css(_getTransformation(0));

                            setTimeout(function () {
                                mask.css('opacity', opacity);
                                if (parseInt(mask.attr('counter'))<1) {
                                    mask.hide();
                                    mask.attr('counter', 0);
                                }
                            }, 300);
                        } else {
                            if (parseInt(mask.attr('counter'))<1) {
                                mask.hide();
                                mask.attr('counter', 0);
                            }
                        }
                    }

                    Common.NotificationCenter.trigger('modal:close', this);
                }

                this.$window.remove();

                suppressevent!==true && this.fireEvent('close', this);
            },

            hide: function() {
                $(document).off('keydown.' + this.cid);
                if (this.$window) {
                    if (this.initConfig.modal) {
                        var mask = _getMask(),
                            hide_mask = true;
                        mask.attr('counter', parseInt(mask.attr('counter'))-1);

                        if (this.$lastmodal.length > 0) {
                            this.$lastmodal.removeClass('dethrone');
                            hide_mask = !(this.$lastmodal.hasClass('modal') && this.$lastmodal.is(':visible'));
                        }

                        if ( hide_mask ) {
                            if (this.options.animate !== false) {
                                var opacity = mask.css('opacity');
                                mask.css(_getTransformation(0));

                                setTimeout(function () {
                                    mask.css('opacity', opacity);
                                    if (parseInt(mask.attr('counter'))<1) {
                                        mask.hide();
                                        mask.attr('counter', 0);
                                    }
                                }, 300);
                            } else {
                                if (parseInt(mask.attr('counter'))<1) {
                                    mask.hide();
                                    mask.attr('counter', 0);
                                }
                            }
                        }
                        Common.NotificationCenter.trigger('modal:hide', this);
                    }
                    this.$window.hide();
                    this.$window.removeClass('notransform');
                    this.fireEvent('hide', this);
                }
            },

            isLocked: function() {
                return this.$window.hasClass('dethrone') ||
                            (!this.initConfig.modal && this.$window.parent().find('.asc-window.modal:visible').length);
            },

            getChild: function(selector) {
                return selector ? this.$window.find(selector) : this.$window;
            },

            setWidth: function(width) {
                if (width >= 0) {
                    var min = parseInt(this.$window.css('min-width'));
                    width < min && (width = min);
                    width -= (parseInt(this.$window.css('border-left-width')) + parseInt(this.$window.css('border-right-width')));
                    this.$window.width(width);
                }
            },

            getWidth: function() {
                return parseInt(this.$window.css('width'));
            },

            setHeight: function(height) {
                if (height >= 0) {
                    var min = parseInt(this.$window.css('min-height'));
                    height < min && (height = min);
                    height -= (parseInt(this.$window.css('border-bottom-width')) + parseInt(this.$window.css('border-top-width')));
                    this.$window.height(height);

                    if (this.initConfig.header)
                        height -= parseInt(this.$window.find('> .header').css('height'));

                    this.$window.find('> .body').css('height', height);
                }
            },

            getHeight: function() {
                return parseInt(this.$window.css('height'));
            },

            setSize: function(w, h) {
                this.setWidth(w);
                this.setHeight(h);
            },

            getSize: function() {
                return [this.getWidth(), this.getHeight()];
            },

            setTitle: function(title) {
                this.$window.find('> .header > .title').text(title);
            },

            getTitle: function() {
                return this.$window.find('> .header > .title').text();
            },

            getLeft: function() {
                return parseInt(this.$window.css('left'));
            },

            getTop: function() {
                return parseInt(this.$window.css('top'));
            },

            isVisible: function() {
                return this.$window && this.$window.is(':visible');
            },

            setResizable: function(resizable, minSize, maxSize) {
                if (resizable !== this.resizable) {
                    if (resizable) {
                        var bordersTemplate = '<div class="resize-border left" style="top:' + ((this.initConfig.header) ? '33' : '5') + 'px; bottom: 5px; height: auto; border-right-style: solid; cursor: w-resize;"></div>' +
                            '<div class="resize-border left bottom" style="border-bottom-left-radius: 5px; cursor: sw-resize;"></div>' +
                            '<div class="resize-border bottom" style="left: 4px; right: 4px; width: auto; z-index: 2; border-top-style: solid; cursor: s-resize;"></div>' +
                            '<div class="resize-border right bottom" style="border-bottom-right-radius: 5px; cursor: se-resize;"></div>' +
                            '<div class="resize-border right" style="top:' + ((this.initConfig.header) ? '33' : '5') + 'px; bottom: 5px; height: auto; border-left-style: solid; cursor: e-resize;"></div>' +
                            '<div class="resize-border left top" style="border-top-left-radius: 5px; cursor: nw-resize;"></div>' +
                            '<div class="resize-border top" style="left: 4px; right: 4px; width: auto; z-index: 2; border-bottom-style:' + ((this.initConfig.header) ? "none" : "solid") + '; cursor: n-resize;"></div>' +
                            '<div class="resize-border right top" style="border-top-right-radius: 5px; cursor: ne-resize;"></div>';
                        if (this.initConfig.header)
                            bordersTemplate += '<div class="resize-border left" style="top: 5px; height: 28px; cursor: w-resize;"></div>' +
                                               '<div class="resize-border right" style="top: 5px; height: 28px; cursor: e-resize;"></div>';

                        this.$window.append(_.template(bordersTemplate));

                        this.binding.resize         = _.bind(_resize, this);
                        this.binding.resizeStop     = _.bind(_resizestop, this);
                        this.binding.resizeStart    = _.bind(_resizestart, this);

                        (minSize && minSize.length>1) && (this.initConfig.minwidth = minSize[0]);
                        (minSize && minSize.length>1) && (this.initConfig.minheight = minSize[1]);
                        (maxSize && maxSize.length>1) && (this.initConfig.maxwidth = maxSize[0]);
                        (maxSize && maxSize.length>1) && (this.initConfig.maxheight = maxSize[1]);

                        this.$window.find('.resize-border').on('mousedown', this.binding.resizeStart);
                    } else {
                        this.$window.find('.resize-border').remove();
                    }
                    this.resizable = resizable;
                }
            },

            suspendKeyEvents: function () {
                this.pauseKeyEvents = false;
            },
            
            resumeKeyEvents: function () {
                this.initConfig.enableKeyEvents && (this.pauseKeyEvents = true);
            },

            onPrimary: function() {},

            cancelButtonText: 'Cancel',
            okButtonText: 'OK',
            yesButtonText: 'Yes',
            noButtonText: 'No',
            closeButtonText: 'Close',
            textWarning: 'Warning',
            textError: 'Error',
            textConfirmation: 'Confirmation',
            textInformation: 'Information',
            textDontShow: 'Don\'t show this message again'
        };

    })(), Common.UI.Window || {}));
});