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
    'text!visioeditor/main/app/template/StatusBar.template',
    'jquery',
    'underscore',
    'backbone',
    'tip',
    'common/main/lib/component/TabBar',
    'common/main/lib/component/Menu',
    'common/main/lib/component/Window'
 ],
    function(template, $, _, Backbone){
        'use strict';

        function _onCurrentPage(number){
            this._state.pageCurrent = number;
        }

        function _onAppReady(config) {
            var me = this;
            me.btnScrollBack.updateHint(me.tipPrev);
            me.btnScrollNext.updateHint(me.tipNext);
            me.btnZoomToPage.updateHint(me.tipFitPage);
            me.btnZoomToWidth.updateHint(me.tipFitWidth);
            me.cntSheetList.updateHint(me.tipListOfSheets);
            VE.getController('Common.Controllers.Shortcuts').updateShortcutHints({
                ZoomOut: {
                    btn: me.btnZoomDown,
                    label: me.tipZoomOut + Common.Utils.String.platformKey('Ctrl+-')
                },
                ZoomIn: {
                    btn: me.btnZoomUp,
                    label: me.tipZoomIn + Common.Utils.String.platformKey('Ctrl++')
                }
            });

            me.cntZoom.updateHint(me.tipZoomFactor);
            me.cntZoom.cmpEl.on({
                'show.bs.dropdown': function () {
                    _.defer(function(){
                        me.cntZoom.cmpEl.find('ul').focus();
                    }, 100);
                },
                'hide.bs.dropdown': function () {
                    _.defer(function(){
                        me.api.asc_enableKeyEvents(true);
                    }, 100);
                }
            });

            me.tabbar.on({
                'tab:invisible'     : _.bind(me.onTabInvisible, me),
                'tab:changed'       : _.bind(me.onSheetChanged, me)
            });
        }

        VE.Views.Statusbar = Common.UI.BaseView.extend(_.extend({
            el: '#statusbar',
            template: _.template(template),

            events: function() {
                return {
                    'click #status-btn-tabback': _.bind(this.onBtnTabScroll, this, 'backward'),
                    'click #status-btn-tabnext': _.bind(this.onBtnTabScroll, this, 'forward')
                };
            },

            api: undefined,

            initialize: function (options) {
                _.extend(this, options);
                this._state = { pageCurrent: 0 };
                this._isDisabled = false;

                var promise = new Promise(function (accept, reject) {
                    accept();
                });

                Common.NotificationCenter.on('app:ready', function(mode) {
                    promise.then( _onAppReady.bind(this, mode) );
                }.bind(this));
                Common.NotificationCenter.on('uitheme:changed', _.bind(function() {
                    this.setMode();
                }, this));
            },

            render: function(config) {
                var me = this;
                $(this.el).html(this.template({
                    scope: this
                }));

                this.cntStatusbar = $('.statusbar', this.el);
                this.isCompact = Common.localStorage.getBool('ve-compact-statusbar', true);
                if (!this.isCompact) {
                    this.cntStatusbar.addClass('no-compact');
                }

                this.editMode = false;
                this.isRtlSheet = Common.UI.isRTL();
                this.tabBarDefPosition = 106;

                this.btnZoomDown = new Common.UI.Button({
                    el: $('#status-btn-zoomdown',this.el),
                    hintAnchor: 'top'
                });

                this.btnZoomUp = new Common.UI.Button({
                    el: $('#status-btn-zoomup',this.el),
                    hintAnchor: 'top-right'
                });

                this.btnZoomToPage = new Common.UI.Button({
                    el: $('#status-btn-zoom-topage',this.el),
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.btnZoomToWidth = new Common.UI.Button({
                    el: $('#status-btn-zoom-towidth',this.el),
                    hintAnchor: 'top',
                    toggleGroup: 'status-zoom',
                    enableToggle: true
                });

                this.btnScrollBack = new Common.UI.Button({
                    el: $('#status-btn-tabback',this.el),
                    disabled: true,
                    hintAnchor: 'top'
                });

                this.btnScrollNext = new Common.UI.Button({
                    el: $('#status-btn-tabnext',this.el),
                    disabled: true,
                    hintAnchor: 'top'
                });

                var cnttablist = $('.cnt-tabslist', this.el);
                this.cntSheetList = new Common.UI.Button({
                    el: cnttablist,
                    hintAnchor: 'top'
                });
                this.btnSheetList = $('#status-btn-tabslist',this.$el);
                this.sheetListMenu = new Common.UI.Menu({
                    style: 'margin-top:-3px;',
                    menuAlign: 'bl-tl',
                    maxHeight: 300
                });
                this.sheetListMenu.on('item:click', function(obj,item) {
                    me.fireEvent('show:tab', [item.value]);
                });
                this.cntSheetList.cmpEl.on({
                    'show.bs.dropdown': function () {
                        _.defer(function(){
                            me.cntSheetList.cmpEl.find('ul').focus();
                        }, 100);
                    },
                    'hide.bs.dropdown': function () {
                        _.defer(function(){
                            me.api.asc_enableKeyEvents(true);
                        }, 100);
                    }
                });
                this.sheetListMenu.render(cnttablist);
                this.sheetListMenu.cmpEl.attr({tabindex: -1});
                cnttablist.on('app:scaling', function () {
                    me.setMode();
                });

                this.cntZoom = new Common.UI.Button({
                    el: $('.cnt-zoom',this.el),
                    hintAnchor: 'top'
                });

                this.zoomMenu = new Common.UI.Menu({
                    style: 'margin-top:-5px;',
                    menuAlign: 'bl-tl',
                    items: [
                        { caption: "50%", value: 50 },
                        { caption: "75%", value: 75 },
                        { caption: "100%", value: 100 },
                        { caption: "125%", value: 125 },
                        { caption: "150%", value: 150 },
                        { caption: "175%", value: 175 },
                        { caption: "200%", value: 200 },
                        { caption: "300%", value: 300 },
                        { caption: "400%", value: 400 },
                        { caption: "500%", value: 500 }
                    ]
                });
                this.zoomMenu.render($('.cnt-zoom',this.el));
                this.zoomMenu.cmpEl.attr({tabindex: -1});

                this.labelZoom = $('#status-label-zoom',this.$el);

                this.tabBarBox = $('#status-sheets-bar-box', this.el);
                this.tabbar = new Common.UI.TabBar({
                    el: '#status-sheets-bar',
                    placement: 'bottom',
                    draggable: false
                }).render();

                this.boxZoom = $('#status-zoom-box', this.el);
                this.boxZoom.find('.separator').css('border-left-color','transparent');

                this.boxNumberSheets = $('#status-number-of-sheet', this.el);
                this.isCompact && this.boxNumberSheets.hide();
                this.labelNumberSheets = $('#label-sheets', this.boxNumberSheets);

                this.boxAction = $('#status-action', this.el);
                this.boxAction.hide();
                this.labelAction = $('#label-action', this.boxAction);

                this.updateRtlSheet();

                this.fireEvent('render:after', [this]);

                return this;
            },

            setApi: function(api) {
                this.api = api;

                if (this.api) {
                    this.api.asc_registerCallback('asc_onCurrentPage',  _.bind(_onCurrentPage, this));
                }
                return this;

            },

            setMode: function(mode) {
                this.mode = mode;
                this.tabBarDefPosition = parseInt($('#status-tabs-scroll').css('width')) + parseInt(this.cntStatusbar.css('padding-left'));
                this.tabBarDefPosition += parseFloat($('#status-addtabs-box').css('width'));
                this.updateTabbarBorders();
            },

            setVisible: function(visible) {
                visible
                    ? this.show()
                    : this.hide();
            },

            isVisible: function() {
                return this.$el && this.$el.is(':visible');
            },

            update: function() {
                var me = this;

                this.tabbar.empty(true);
                this.sheetListMenu.removeAll();

                if (this.api) {
                    var wc = this.api.getCountPages(), i = -1;
                    var items = [], tab;
                    var sindex = this._state.pageCurrent;

                    while (++i < wc) {
                        tab = {
                            sheetindex    : i,
                            index         : items.length,
                            active        : sindex == i,
                            label         : this.api.asc_getPageName(i) || me.txtPage + (i+1),
                            isLockTheDrag : true
                        };
                        items.push(tab);
                    }
                    this.tabbar.add(items);

                    items.forEach(function(item){
                        var hidden = false;//me.api.asc_isWorksheetHidden(item.sheetindex);
                        me.sheetListMenu.addItem(new Common.UI.MenuItem({
                            style: 'white-space: pre',
                            caption: Common.Utils.String.htmlEncode(item.label),
                            value: item.sheetindex,
                            checkable: true,
                            checked: item.active,
                            hidden: hidden,
                            visible: !hidden,
                            textHidden: me.itemHidden,
                            template: _.template([
                                '<a id="<%= id %>" style="<%= style %>" tabindex="-1" type="menuitem" <% if (options.hidden) { %> data-hidden="true" <% } %>>',
                                '<div class="color"></div>',
                                '<span class="name"><%= caption %></span>',
                                '<span class="hidden-mark"><% if (options.hidden) { %><%=  options.textHidden %><% } else { %><% } %></span>',
                                '</a>'
                            ].join(''))
                        }));
                    });

                    if (!_.isUndefined(this.tabBarScroll)) {
                        this.tabbar.$bar.scrollLeft(this.tabBarScroll.scrollLeft);
                        this.tabBarScroll = undefined;
                    }
                    if (!this.tabbar.isTabVisible(sindex))
                        this.tabbar.setTabVisible(sindex);

                    this.updateRtlSheet();
                    this.updateNumberOfSheet(sindex, wc);
                    this.updateTabbarBorders();

                    me.fireEvent('sheet:changed', [me, sindex]);
                }
            },

            updateRtlSheet: function() {
                this.isRtlSheet = Common.UI.isRTL();
                this.cntStatusbar.toggleClass('rtl-sheet', this.isRtlSheet);
                this.cntStatusbar.attr({dir: this.isRtlSheet ? 'rtl' : 'ltr'});
                this.tabbar.setDirection(this.isRtlSheet);
                var dir = (this.isCompact ? this.isRtlSheet : Common.UI.isRTL()) ? 'rtl' : 'ltr';
                this.boxZoom.attr({dir: dir});
            },

            onSheetChanged: function(o, index, tab) {
                this.api.goToPage(tab.sheetindex);

                this.updateNumberOfSheet(tab.sheetindex, this.api.getCountPages());

                if (this.hasTabInvisible && !this.tabbar.isTabVisible(index)) {
                    this.tabbar.setTabVisible(index);
                }

                this.updateRtlSheet();
                this.updateTabbarBorders();
                this.fireEvent('sheet:changed', [this, tab.sheetindex]);
            },

            onTabInvisible: function(obj, opts) {
                if (this.btnScrollBack.isDisabled() !== (!opts.first)) {
                    this.btnScrollBack.setDisabled(!opts.first);
                }
                if (this.btnScrollNext.isDisabled() !== (!opts.last)) {
                    this.btnScrollNext.setDisabled(!opts.last);
                }
                this.hasTabInvisible = opts.first || opts.last;
            },

            onBtnTabScroll: function(action, e) {
                this.tabbar.setTabVisible(action);
            },

            updateTabbarBorders: function() {
                var visible = false;
                var right = parseFloat(this.boxZoom.css('width'));
                if (this.isCompact) {
                    var tabsWidth = this.tabbar.getWidth();
                    if (this.boxAction.is(':visible')) {
                        var actionWidth = this.actionWidth || 140;
                        if (Common.Utils.innerWidth() - right - this.tabBarDefPosition - actionWidth - tabsWidth > 0) { // docWidth - right - left - this.boxAction.width
                            var left = tabsWidth + this.tabBarDefPosition;
                            if (this.isRtlSheet) {
                                this.boxAction.css({'left': right + 'px', 'right': left + 'px', 'width': 'auto'});
                                this.boxAction.find('.separator').css('border-right-color', 'transparent');
                            } else {
                                this.boxAction.css({'right': right + 'px', 'left': left + 'px', 'width': 'auto'});
                                this.boxAction.find('.separator').css('border-left-color', 'transparent');
                            }
                        } else {
                            if (this.isRtlSheet) {
                                this.boxAction.css({'left': right + 'px', 'right': 'auto', 'width': actionWidth + 'px'});
                                this.boxAction.find('.separator').css('border-right-color', '');
                            } else {
                                this.boxAction.css({'right': right + 'px', 'left': 'auto', 'width': actionWidth + 'px'});
                                this.boxAction.find('.separator').css('border-left-color', '');
                            }
                            visible = true;
                        }
                        right += parseInt(this.boxAction.css('width'));
                    } else if (Common.Utils.innerWidth() - right - this.tabBarDefPosition - tabsWidth <=0)
                        visible = true;

                    this.boxZoom.css({'top': '0px', 'bottom': 'auto'});
                    if (this.isRtlSheet) {
                        this.tabBarBox.css('left', right + 'px');
                        this.tabBarBox.css('right', this.tabBarDefPosition + 'px');
                        this.boxZoom.find('.separator').css('border-right-color', visible ? '' : 'transparent');
                    } else {
                        this.tabBarBox.css('left', this.tabBarDefPosition + 'px');
                        this.tabBarBox.css('right', right + 'px');
                        this.boxZoom.find('.separator').css('border-left-color', visible ? '' : 'transparent');
                    }
                } else {
                    if (this.boxAction.is(':visible')) {
                        if (Common.UI.isRTL()) {
                            this.boxAction.css({'left': right + 'px', 'right': '135px', 'width': 'auto'});
                            this.boxAction.find('.separator').css('border-right-color', 'transparent');
                        } else {
                            this.boxAction.css({'right': right + 'px', 'left': '135px', 'width': 'auto'});
                            this.boxAction.find('.separator').css('border-left-color', 'transparent');
                        }
                    }
                    this.boxZoom.css({'top': 'auto', 'bottom': '0px'});
                    this.boxZoom.find('.separator').css(Common.UI.isRTL() ? 'border-right-color' : 'border-left-color', visible ? '' : 'transparent');
                    if (this.isRtlSheet) {
                        this.tabBarBox.css('left', '0px');
                        this.tabBarBox.css('right', this.tabBarDefPosition + 'px');
                    } else {
                        this.tabBarBox.css('left', this.tabBarDefPosition + 'px');
                        this.tabBarBox.css('right', '0px');
                    }
                }

                if (this.statusMessage) {
                    var status = this.getStatusMessage(this.statusMessage);
                    if (status !== this.boxAction.text().trim()) {
                        this.labelAction.text(status);
                    }
                }
            },

            changeViewMode: function (mode) {
                var edit = mode.isEdit,
                    styleLeft = this.isRtlSheet ? 'right' : 'left';
                if (edit) {
                    this.tabBarBox.css(styleLeft, this.tabBarDefPosition + 'px');
                } else {
                    this.tabBarBox.css(styleLeft, '');
                }

                this.tabbar.options.draggable = edit;
                this.editMode = edit;
            },

            onChangeCompact: function (compact) {
                this.isCompact = compact;
                if (compact) {
                    this.cntStatusbar.removeClass('no-compact');
                    this.boxNumberSheets.hide();
                    //this.boxAction.hide();
                } else {
                    this.cntStatusbar.addClass('no-compact');
                    this.boxNumberSheets.show();
                    //this.boxAction.show();
                }
                this.updateRtlSheet();
                this.updateTabbarBorders();
                (this.tabbar.getCount()>0) && this.onTabInvisible(undefined, this.tabbar.checkInvisible(true));
            },

            updateNumberOfSheet: function (active, count) {
                this.labelNumberSheets.text(
                    Common.Utils.String.format(this.sheetIndexText, active + 1, count)
                );
            },

            getStatusMessage: function (message) {
                var _message;
                if (this.isCompact && message.length > 23 && this.boxAction.width() < 180) {
                    _message = message.substr(0, 23).trim() + '...'
                } else {
                    _message = message;
                }
                return _message;
            },

            getStatusLabel: function() {
                return this.labelAction;
            },

            showStatusMessage: function(message, callback) {
                this.statusMessage = message;
                if (!this.actionWidth) {
                    this.actionWidth = message.length > 22 ? 166 : 140;
                }
                this.labelAction.text(this.getStatusMessage(message));
                if (!this.boxAction.is(':visible')) {
                    this.boxAction.show();
                }
                var me = this;
                _.delay(function(){
                    me.updateTabbarBorders();
                    me.onTabInvisible(undefined, me.tabbar.checkInvisible(true));
                    callback && callback();
                },30);
            },

            clearStatusMessage: function() {
                this.labelAction.text('');
                this.statusMessage = undefined;
            },

            SetDisabled: function(disable) {
                this._isDisabled = disable;
            },

            tipFitPage          : 'Fit to Page',
            tipFitWidth         : 'Fit to Width',
            tipZoomIn           : 'Zoom In',
            tipZoomOut          : 'Zoom Out',
            tipZoomFactor       : 'Magnification',
            txtPage             : 'Page',
            sheetIndexText      : 'Page {0} of {1}',
            tipPrev             : 'Previous page',
            tipNext             : 'Next page',
            tipListOfSheets     : 'List of pages'

        }, VE.Views.Statusbar || {}));
    }
);