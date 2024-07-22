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
 *    Window.js
 *
 *    Created on 24 January 2014
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
 *      @cfg {Object} buttons
 *          Use an array for predefined buttons (ok, cancel, yes, no): @example ['yes', 'no']
 *          Use a named array for the custom buttons: {value: caption, ...}
 *              @param {String} value will be returned in callback function
 *              @param {String} caption
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
    'common/main/lib/component/BaseView',
    'common/main/lib/component/CheckBox',
    'common/main/lib/controller/FocusManager'
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
                help:       false,
                maxwidth: undefined,
                maxheight: undefined,
                minwidth: 0,
                minheight: 0,
                enableKeyEvents: true,
                automove: true,
                role: 'dialog'
        };

        var template = '<div class="asc-window<%= modal?" modal":"" %><%= cls?" "+cls:"" %>" id="<%= id %>" style="width:<%= width %>px;" role="<%= role %>" aria-modal="<%= modal %>">' +
                            '<% if (header==true) { %>' +
                                '<div class="header">' +
                                    '<div class="tools">' +
                                    '<% if (closable!==false) %>' +
                                        '<div class="tool close"></div>' +
                                    '<% %>' +
                                    '<% if (help===true) %>' +
                                        '<div class="tool help">?</div>' +
                                    '<% %>' +
                                    '</div>' +
                                    '<div class="title"><%= title %></div> ' +
                                '</div>' +
                            '<% } %>' +
                            '<div class="body"><%= tpl %>' +
                                '<% if (typeof (buttonsParsed) !== "undefined" && _.size(buttonsParsed) > 0) { %>' +
                                '<div class="footer">' +
                                    '<% _.each(buttonsParsed, function (item) { %>' +
                                        '<button class="btn normal dlg-btn <%= item.cls %>" result="<%= item.value %>" <% if (item.id) { %>id="<%=item.id%>" <% } %> ><%= item.text %></button>'+
                                    '<% }); %>' +
                                '</div>' +
                                '<% } %>' +
                            '</div>' +
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
                if (this.initConfig.keydowncallback && this.initConfig.keydowncallback.call(this, event))
                    return false;

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
                        var target = $(event.target);
                        if (target.hasClass('dlg-btn') && !target.hasClass('primary')) return;

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

        function _readDocumetGeometry() {
            if (window.innerHeight == undefined) {
                var width  = document.documentElement.offsetWidth,
                height = document.documentElement.offsetHeight;
            } else {
                width  = Common.Utils.innerWidth();
                height = Common.Utils.innerHeight();
            }
            height -= Common.Utils.InternalSettings.get('window-inactive-area-top');
            return {width: width, height: height, top: Common.Utils.InternalSettings.get('window-inactive-area-top')};
        }

        function _autoSize() {
            if (this.initConfig.height == 'auto') {
                var height = Math.ceil(parseFloat(this.$window.find('> .body').css('height')));
                this.initConfig.header && (height += parseInt(this.$window.find('> .header').css('height')));
                this.$window.height(height);
            }
        }

        function _centre() {
            var main_geometry = _readDocumetGeometry(),
                main_width = main_geometry.width,
                main_height = main_geometry.height;

            if (this.initConfig.height == 'auto') {
                var win_height = parseInt(this.$window.find('.body').css('height'));
                this.initConfig.header && (win_height += parseInt(this.$window.find('.header').css('height')));
            } else {
                win_height = this.initConfig.height;
                win_height > main_height && (win_height = main_height);
            }

            var win_width = (this.initConfig.width=='auto') ? parseInt(this.$window.find('.body').css('width')) : this.initConfig.width;
            
            var top  = main_geometry.top + Math.floor((parseInt(main_height) - parseInt(win_height)) / 2);
            var left = Math.floor((parseInt(main_width) - parseInt(win_width)) / 2);

            this.$window.css({
                left: left < 0 ? 0 : left,
                top: top < 0 ? 0 : top
            });
        }

        function _setVisible() {
            var main_geometry = _readDocumetGeometry(),
                main_width = main_geometry.width,
                main_height = main_geometry.height;

            if (this.getLeft() + this.getWidth() > main_width)
                this.$window.css('left', main_width - this.getWidth());

            if (this.getTop() < main_geometry.top )
                this.$window.css('top', main_geometry.top);
            else
            if (this.getTop() + this.getHeight() > main_height) {
                if (main_height - this.getHeight() < 0)
                    this.$window.css('top', main_geometry.top);
                else this.$window.css('top', main_geometry.top + main_height - this.getHeight());
            }
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
            if ( $(event.target).hasClass('close') || $(event.target).hasClass('help') ) return;
            Common.UI.Menu.Manager.hideAll();
            var zoom = (event instanceof jQuery.Event) ? Common.Utils.zoom() : 1;
            this.dragging.enabled = true;
            this.dragging.initx = event.pageX*zoom - this.getLeft();
            this.dragging.inity = event.pageY*zoom - this.getTop();

            var main_geometry = _readDocumetGeometry(),
                main_width = main_geometry.width,
                main_height = main_geometry.height;

            this.dragging.maxx  = main_width - this.getWidth();
            this.dragging.maxy  = main_height - this.getHeight();
            if (this.dragging.maxy < 0)
                    this.dragging.maxy = 0;
            this.dragging.maxy += main_geometry.top;

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
                    top     = event.pageY*zoom - this.dragging.inity,
                    topedge = Common.Utils.InternalSettings.get('window-inactive-area-top');

                left < 0 ? (left = 0) : left > this.dragging.maxx && (left = this.dragging.maxx);
                top < topedge ? (top = topedge) : top > this.dragging.maxy && (top = this.dragging.maxy);

                this.$window.css({left: left, top: top});
            }
        }

        function _onProcessMouse(data) {
            if (data.type == 'mouseup' && this.dragging.enabled) {
                _mouseup.call(this);
            }
        }

        function _onResizeMove(){
            var main_geometry = _readDocumetGeometry(),
                main_width = main_geometry.width,
                main_height = main_geometry.height,
                win_height = this.getHeight(),
                win_width = this.getWidth(),
                top = this.getTop(),
                left = this.getLeft();

            top = top + win_height > main_height ? main_height - win_height : top;
            left = left + win_width > main_width ? main_width - win_width : left;

            this.$window.css({
                left: left < 0 ? 0 : left,
                top: top < 0 ? 0 : top
            });
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

            var main_geometry = _readDocumetGeometry(),
                main_width = main_geometry.width,
                main_height = main_geometry.height;
            var maxwidth = (this.initConfig.maxwidth) ? this.initConfig.maxwidth : main_width,
                maxheight = (this.initConfig.maxheight) ? this.initConfig.maxheight : main_height;

            this.resizing.minw  = this.initConfig.minwidth;
            this.resizing.maxw = (this.resizing.type[0]>0) ? Math.min(main_width-left, maxwidth) : Math.min(left+this.resizing.initw, maxwidth);

            this.resizing.minh  = this.initConfig.minheight;
            this.resizing.maxh  = (this.resizing.type[1]>0) ? Math.min(main_height-top, maxheight) : Math.min(top+this.resizing.inith, maxheight);

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
                if (this.resizing.type[0]) {
                    var new_width = this.resizing.initw + (pageX - this.resizing.initpage_x) * this.resizing.type[0];
                    if (new_width>this.resizing.maxw) {
                        pageX = pageX - (new_width-this.resizing.maxw) * this.resizing.type[0];
                        new_width = this.resizing.maxw;
                    } else if (new_width<this.resizing.minw) {
                        pageX = pageX - (new_width-this.resizing.minw) * this.resizing.type[0];
                        new_width = this.resizing.minw;
                    }

                    if (this.resizing.type[0]<0)
                        this.$window.css({left: pageX - this.resizing.initx});
                    this.setWidth(new_width);
                    resized = true;
                }
                if (this.resizing.type[1]) {
                    var new_height = this.resizing.inith + (pageY - this.resizing.initpage_y) * this.resizing.type[1];
                    if (new_height>this.resizing.maxh) {
                        pageY = pageY - (new_height-this.resizing.maxh) * this.resizing.type[1];
                        new_height = this.resizing.maxh;
                    } else if (new_height<this.resizing.minh) {
                        pageY = pageY - (new_height-this.resizing.minh) * this.resizing.type[1];
                        new_height = this.resizing.minh;
                    }

                    if (this.resizing.type[1]<0)
                        this.$window.css({top: pageY - this.resizing.inity});
                    this.setHeight(new_height);
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

            if (!options.buttons) {
                options.buttons = ['ok'];
            }
            options.dontshow = options.dontshow || false;

            if (!options.width) options.width = 'auto';
            
            var template =  '<div class="info-box">' +
                                '<% if (typeof iconCls !== "undefined") { %><div class="icon <%= iconCls %>"></div><% } %>' +
                                '<div class="text" <% if (typeof iconCls == "undefined") { %> style="padding-' + (Common.UI.isRTL() ? 'right' : 'left') + ':10px;"<% } %>><span><%= msg %></span>' +
                                    '<% if (dontshow) { %><div class="dont-show-checkbox"></div><% } %>' +
                                '</div>' +
                            '</div>' +
                            '<% if (dontshow) { %><div class="separator horizontal" style="width: 100%;"></div><% } %>';

            _.extend(options, {
                cls: 'alert',
                onprimary: onKeyDown,
                getFocusedComponents: getFocusedComponents,
                getDefaultFocusableComponent: getDefaultFocusableComponent,
                tpl: _.template(template)(options),
                role: 'alertdialog'
            });

            var win = new Common.UI.Window(options),
               chDontShow = null;
            win.getFocusedComponents = getFocusedComponents;
            win.getDefaultFocusableComponent = getDefaultFocusableComponent;

            function autoSize(window) {
                var text_cnt    = window.getChild('.info-box');
                var text        = window.getChild('.info-box .text > span');
                var footer      = window.getChild('.footer');
                var header      = window.getChild('.header');
                var body        = window.getChild('.body');
                var icon        = window.getChild('.icon'),
                    icon_height = (icon.length>0) ? icon.height() : 0,
                    icon_width = (icon.length>0) ? $(icon).outerWidth(true) : 0;
                var check       = window.getChild('.info-box .dont-show-checkbox');

                if (!options.dontshow) body.css('padding-bottom', '10px');

                if (options.maxwidth && options.width=='auto') {
                    var width = !Common.UI.isRTL() ? (text.position().left + text.width() + parseInt(text_cnt.css('padding-right'))) :
                        (parseInt(text_cnt.css('padding-right')) + icon_width + text.width() + parseInt(text_cnt.css('padding-left')));
                    if (width > options.maxwidth)
                        options.width = options.maxwidth;
                }
                if (options.width=='auto') {
                    text_cnt.height(Math.max(text.height(), icon_height) + ((check.length>0) ? (check.height() + parseInt(check.css('margin-top'))) : 0));
                    body.height(parseInt(text_cnt.css('height')) + parseInt(footer.css('height')));
                    var span_el = check.find('span');
                    var width = !Common.UI.isRTL() ?
                        (Math.max(text.width(), span_el.length>0 ? span_el.position().left + span_el.width() : 0) + text.position().left + parseInt(text_cnt.css('padding-right'))) :
                        (parseInt(text_cnt.css('padding-right')) + icon_width + parseInt(text_cnt.css('padding-left')) +
                            (Math.max(text.width(), check.length>0 ? $(check).find('.checkbox-indeterminate').outerWidth(true) : 0)));
                    window.setSize(width, parseInt(body.css('height')) + parseInt(header.css('height')));
                } else {
                    text.css('white-space', 'normal');
                    window.setWidth(options.width);
                    text_cnt.height(Math.max(text.height(), icon_height) + ((check.length>0) ? (check.height() + parseInt(check.css('margin-top'))) : 0));
                    body.height(parseInt(text_cnt.css('height')) + parseInt(footer.css('height')));
                    window.setHeight(parseInt(body.css('height')) + parseInt(header.css('height')));
                }
                if (text.height() < icon_height/2)
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

            function getFocusedComponents(event) {
                return win.getFooterButtons();
           }

            function getDefaultFocusableComponent() {
                return _.find(win.getFooterButtons(), function (item) {
                    return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
                });
            }

            win.on({
                'render:after': function(obj){
                    var footer = obj.getChild('.footer');
                    options.dontshow && footer.addClass('dontshow');
                    footer.find('.dlg-btn').on('click', onBtnClick);
                    chDontShow = new Common.UI.CheckBox({
                        el: win.$window.find('.dont-show-checkbox'),
                        labelText: options.textDontShow || win.textDontShow
                    });
                    autoSize(obj);
                },
                close: function() {
                    options.callback && options.callback.call(win, 'close');
                }
            });

            win.show();
            return win;
        };

        Common.UI.error = function(options) {
            options = options || {};
            !options.title && (options.title = this.Window.prototype.textError);

            return Common.UI.alert(
                _.extend(options, {
                    iconCls: 'error'
                })
            );
        };

        Common.UI.confirm = function(options) {
            options = options || {};
            !options.title && (options.title = this.Window.prototype.textConfirmation);

            return Common.UI.alert(
                _.extend(options, {
                    iconCls: 'confirm'
                })
            );
        };

        Common.UI.info = function(options) {
            options = options || {};
            !options.title && (options.title = this.Window.prototype.textInformation);

            return Common.UI.alert(
                _.extend(options, {
                    iconCls: 'info'
                })
            );
        };

        Common.UI.warning = function(options) {
            options = options || {};
            !options.title && (options.title = this.Window.prototype.textWarning);

            return Common.UI.alert(
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

                var arrBtns = {ok: this.okButtonText, cancel: this.cancelButtonText,
                    yes: this.yesButtonText, no: this.noButtonText,
                    close: this.closeButtonText};

                if (options.buttons && _.isArray(options.buttons)) {
                    if (options.primary==undefined)
                        options.primary = 'ok';
                    var newBtns = [];
                    _.each(options.buttons, function(b){
                        if (typeof(b) == 'object') {
                            if (b.value !== undefined) {
                                var item = {value: b.value, text: b.caption, cls: 'auto' + ((b.primary || options.primary==b.value) ? ' primary' : '')};
                                b.id && (item.id = b.id);
                                newBtns.push(item);
                            }
                        } else if (b!==undefined) {
                            newBtns.push({value: b, text: arrBtns[b], cls: (options.primary==b || _.indexOf(options.primary, b)>-1) ? 'primary' : ''});
                        }
                    });

                    options.buttonsParsed = newBtns;
                    options.footerCls = options.footerCls || 'center';
                }

                _.extend(this.initConfig, config, options || {});

                !this.initConfig.id && (this.initConfig.id = 'window-' + this.cid);
                !this.initConfig.tpl && (this.initConfig.tpl = '');

                Common.UI.BaseView.prototype.initialize.call(this, this.initConfig);
            },

            render: function() {
                var renderto = this.initConfig.renderTo || document.body;
                $(renderto).append(
                    _.template(template)(this.initConfig)
                );

                this.$window = $('#' + this.initConfig.id);

                if (Common.Locale.getCurrentLanguage() && Common.Locale.getCurrentLanguage() !== 'en')
                    this.$window.attr('applang', Common.Locale.getCurrentLanguage());

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
                    var dohelp = function() {
                        if ( this.$window.find('.tool.help').hasClass('disabled') ) return;
                        this.fireEvent('help',this);
                    };
                    this.$window.find('.header').on('mousedown', this.binding.dragStart);
                    this.$window.find('.tool.close').on('click', _.bind(doclose, this));
                    this.$window.find('.tool.help').on('click', _.bind(dohelp, this));
                    if (!this.initConfig.modal)
                        Common.Gateway.on('processmouse', _.bind(_onProcessMouse, this));
                } else {
                    this.$window.find('.body').css({
                        top:0,
                        'border-radius': '5px'
                    });
                }

                if (this.initConfig.height !== 'auto') {
                    this.$window.css('height',this.initConfig.height);
                }

                if (this.initConfig.resizable)
                    this.setResizable(this.initConfig.resizable);

                var me = this;
                this.binding.winclose = function(obj) {
                    if (me.$window && me.isVisible() && me.$window == obj.$window) me.close();
                };
                Common.NotificationCenter.on('window:close', this.binding.winclose);

                this.initConfig.footerCls && this.$window.find('.footer').addClass(this.initConfig.footerCls);

                this.menuAddAlign = function(menuRoot, left, top) {
                    var self = this;
                    if (!me.$window.hasClass('notransform')) {
                        me.$window.addClass('notransform');
                        menuRoot.addClass('hidden');
                        setTimeout(function() {
                            menuRoot.removeClass('hidden');
                            menuRoot.css({left: left, top: top});
                            self.options.additionalAlign = null;
                        }, 300);
                    } else {
                        menuRoot.css({left: left, top: top});
                        self.options.additionalAlign = null;
                    }
                };

                this.fireEvent('render:after',this);
                return this;
            },

            show: function(x,y) {
                if (this.initConfig.modal) {
                    var mask = _getMask();
                    if (this.options.animate === false || this.options.animate && this.options.animate.mask === false) { // animate.mask = false -> don't animate mask
                        mask.attr('counter', parseInt(mask.attr('counter'))+1);
                        mask.show();
                    } else {
                        var maskOpacity = $(':root').css('--modal-window-mask-opacity');

                        mask.css('opacity', 0);
                        mask.attr('counter', parseInt(mask.attr('counter'))+1);
                        mask.show();

                        setTimeout(function () {
                            mask.css(_getTransformation(maskOpacity));
                        }, 1);
                    }

                    Common.NotificationCenter.trigger('modal:show', this);
                    this.$lastmodal = $('.asc-window.modal:not(.dethrone):visible').first().addClass('dethrone');
                }

                if (!this.$window) {
                    this.render();
                    _autoSize.call(this);

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
                if(this.initConfig.automove){
                    this.binding.windowresize = _.bind(_onResizeMove, this);
                    $(window).on('resize', this.binding.windowresize);
                }

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
                        setTimeout(function () {
                            me.fireEvent('animate:after', me);
                        }, 210);
                    }, 1);

                    setTimeout(function () {
                        me.$window.addClass('notransform');
                        me.fireEvent('show', me);
                    }, (this.initConfig.modal) ? 1000 : 350);
                } else {
                    this.$window.css({opacity: 1});
                    this.$window.addClass('notransform');
                    this.fireEvent('show', this);
                    setTimeout(function () {
                        me.fireEvent('animate:after', me);
                    }, 10);
                }

                Common.NotificationCenter.trigger('window:show', this);
            },

            close: function(suppressevent) {
                $(document).off('keydown.' + this.cid);
                this.initConfig.automove && $(window).off('resize', this.binding.windowresize);
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
                            var maskOpacity = $(':root').css('--modal-window-mask-opacity');
                            mask.css(_getTransformation(0));

                            setTimeout(function () {
                                if (parseInt(mask.attr('counter'))<1) {
                                    mask.css('opacity', maskOpacity);
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

                    Common.NotificationCenter.trigger('modal:close', this, hide_mask && (parseInt(mask.attr('counter'))<1));
                }

                this.$window.remove();

                suppressevent!==true && this.fireEvent('close', this);
            },

            hide: function() {
                $(document).off('keydown.' + this.cid);
                this.initConfig.automove && $(window).off('resize', this.binding.windowresize);
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
                                var maskOpacity = $(':root').css('--modal-window-mask-opacity');
                                mask.css(_getTransformation(0));

                                setTimeout(function () {
                                    if (parseInt(mask.attr('counter'))<1) {
                                        mask.css('opacity', maskOpacity);
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
                        Common.NotificationCenter.trigger('modal:hide', this, hide_mask && (parseInt(mask.attr('counter'))<1));
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
                } else {
                    if (resizable) {
                        (minSize && minSize.length>1) && (this.initConfig.minwidth = minSize[0]);
                        (minSize && minSize.length>1) && (this.initConfig.minheight = minSize[1]);
                        (maxSize && maxSize.length>1) && (this.initConfig.maxwidth = maxSize[0]);
                        (maxSize && maxSize.length>1) && (this.initConfig.maxheight = maxSize[1]);
                    }
                }
            },

            suspendKeyEvents: function () {
                this.pauseKeyEvents = false;
            },
            
            resumeKeyEvents: function () {
                this.initConfig.enableKeyEvents && (this.pauseKeyEvents = true);
            },

            onPrimary: function() {},

            getFocusedComponents: function() {
                return [];
            },

            getDefaultFocusableComponent: function() {
            },

            getFooterButtons: function() {
                if (!this.footerButtons) {
                    var arr = [];
                    this.$window.find('.dlg-btn').each(function(index, item) {
                        arr.push(new Common.UI.Button({
                            el: $(item)
                        }));
                    });
                    this.footerButtons = arr;
                }
                return this.footerButtons;
            },

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