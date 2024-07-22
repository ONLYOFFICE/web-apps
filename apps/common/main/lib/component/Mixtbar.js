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
 *  Mixtbar.js
 *
 *  Combined component for toolbar's and header's elements
 *
 *
 *  Created on 4/11/2017.
 *
 */

define([
    'backbone',
    'common/main/lib/component/BaseView',
    'common/main/lib/mods/transition'
], function (Backbone) {
    'use strict';

    Common.UI.Mixtbar = Common.UI.BaseView.extend((function () {
        var $boxTabs;
        var $scrollL;
        var $scrollR;
        var optsFold = {timeout: 2000};
        var config = {};
        var btnsMore = [];

        function setScrollButtonsDisabeled(){
            var scrollLeft = $boxTabs.scrollLeft();
            $scrollL.toggleClass('disabled', Math.floor(scrollLeft) == 0);
            $scrollR.toggleClass('disabled', Math.ceil(scrollLeft) >= $boxTabs[0].scrollWidth - $boxTabs[0].clientWidth);
        }

        var onScrollTabs = function(opts, e) {
            if($(e.target).hasClass('disabled')) return;
            var sv = $boxTabs.scrollLeft();
            if (sv || opts == 'right' || Common.UI.isRTL() && opts == 'left') {
                $boxTabs.animate({scrollLeft: opts == 'left' ? sv - 100 : sv + 100}, 200, setScrollButtonsDisabeled);
            }
        };

        var onWheelTabs = function(e) {
            e.preventDefault();
            var deltaX = e.deltaX || e.detail || e.deltaY;
            $boxTabs.scrollLeft($boxTabs.scrollLeft() + (deltaX * 60));
            setScrollButtonsDisabeled();
        };

        function onTabDblclick(e) {
            var tab = $(e.currentTarget).find('> a[data-tab]').data('tab');
            if ( this.dblclick_el == tab ) {
                this.fireEvent('change:compact', [tab]);
                this.dblclick_el = undefined;
            }
        }

        function onShowFullviewPanel(state) {
            if ( state )
                optsFold.$bar.addClass('cover'); else
                optsFold.$bar.removeClass('cover');
        }

        function onClickDocument(e) {
            if ( this.isFolded ) {
                if ( $(e.target).parents('.toolbar, #file-menu-panel').length ){
                } else {
                    optsFold.$bar && optsFold.$bar.hasClass('expanded') && this.collapse();
                }
            }
        }

        return {
            $tabs: undefined,
            $panels: undefined,
            isFolded: false,

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var _template_tabs =
                    !Common.UI.isRTL() ?
                    '<section class="tabs">' +
                        '<a class="scroll left" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="V"></a>' +
                        '<ul role="tablist">' +
                            '<% for(var i in items) { %>' +
                                '<% if (typeof items[i] == "object") { %>' +
                                '<li class="ribtab' +
                                        '<% if (items[i].haspanel===false) print(" x-lone") %>' +
                                        '<% if (items[i].extcls) print(\' \' + items[i].extcls) %>"' +
                                        '<% if (typeof items[i].layoutname == "string") print(" data-layout-name=" + \' \' +  items[i].layoutname) + \' \' %>>' +
                                    '<a role="tab" id="<%= items[i].action %>" data-tab="<%= items[i].action %>" data-title="<%= items[i].caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof items[i].dataHintTitle !== "undefined") { %> data-hint-title="<%= items[i].dataHintTitle %>" <% } %>><%= items[i].caption %></a>' +
                                '</li>' +
                                '<% } %>' +
                            '<% } %>' +
                        '</ul>' +
                        '<a class="scroll right" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="R"></a>' +
                    '</section>' :
                    '<section class="tabs">' +
                        '<a class="scroll right" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="R"></a>' +
                        '<ul role="tablist">' +
                            '<% for(var i in items) { %>' +
                                '<% if (typeof items[i] == "object") { %>' +
                                '<li class="ribtab' +
                                        '<% if (items[i].haspanel===false) print(" x-lone") %>' +
                                        '<% if (items[i].extcls) print(\' \' + items[i].extcls) %>"' +
                                        '<% if (typeof items[i].layoutname == "string") print(" data-layout-name=" + \' \' +  items[i].layoutname) + \' \' %>>' +
                                    '<a role="tab" id="<%= items[i].action %>" data-tab="<%= items[i].action %>" data-title="<%= items[i].caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof items[i].dataHintTitle !== "undefined") { %> data-hint-title="<%= items[i].dataHintTitle %>" <% } %>><%= items[i].caption %></a>' +
                                '</li>' +
                                '<% } %>' +
                            '<% } %>' +
                        '</ul>' +
                        '<a class="scroll left" data-hint="0" data-hint-direction="bottom" data-hint-offset="-7, 0" data-hint-title="V"></a>' +
                    '</section>';

                this.$layout = $(options.template({
                    tabsmarkup: _.template(_template_tabs)({items: options.tabs}),
                    isRTL: Common.UI.isRTL(),
                    config: options.config
                }));

                config.tabs = options.tabs;
                $(document.body).on('click', onClickDocument.bind(this));

                Common.NotificationCenter.on('tab:visible', _.bind(function(action, visible){
                    this.setVisible(action, visible);
                }, this));
                Common.NotificationCenter.on('tab:resize', _.bind(this.onResizeTabs, this));
            },

            afterRender: function() {
                var me = this;

                $boxTabs = me.$('.tabs > ul');
                me.$tabs = $boxTabs.find('> li');
                me.$boxpanels = me.$('.box-panels');
                me.$panels = me.$boxpanels.find('> .panel');

                optsFold.$bar = me.$('.toolbar');
                $scrollR = me.$('.tabs .scroll.right');
                $scrollL = me.$('.tabs .scroll.left');

                $scrollL.on('click', onScrollTabs.bind(this, 'left'));
                $scrollR.on('click', onScrollTabs.bind(this, 'right'));

                $boxTabs.on('dblclick', '> .ribtab', onTabDblclick.bind(this));
                $boxTabs.on('click', '> .ribtab', me.onTabClick.bind(this));
                $boxTabs.on('mousewheel', onWheelTabs);
            },

            isTabActive: function(tag) {
                var t = this.$tabs.filter('.active').find('> a');
                return t.length && t.data('tab') == tag;
            },

            setFolded: function(value) {
                this.isFolded = value;

                var me = this;
                if ( this.isFolded ) {
                    if (!optsFold.$box) optsFold.$box = me.$el.find('.box-controls');

                    optsFold.$bar.addClass('folded z-clear').toggleClass('expanded', false);
                    optsFold.$bar.find('.tabs .ribtab').removeClass('active');
                    optsFold.$bar.on($.support.transition.end, function (e) {
                        if ( optsFold.$bar.hasClass('folded') && !optsFold.$bar.hasClass('expanded') )
                            optsFold.$bar.toggleClass('z-clear', true);
                    });
                    optsFold.$box.on({
                        mouseleave: function (e) {
                            // optsFold.timer = setTimeout( function(e) {
                            //     clearTimeout(optsFold.timer);
                            //     me.collapse();
                            // }, optsFold.timeout);
                        },
                        mouseenter: function (e) {
                            // clearTimeout(optsFold.timer);
                        }
                    });

                    // $(document.body).on('focus', 'input, textarea', function(e) {
                    // });
                    //
                    // $(document.body).on('blur', 'input, textarea', function(e) {
                    // });
                    //
                    // Common.NotificationCenter.on({
                    //     'modal:show': function(){
                    //     },
                    //     'modal:close': function(dlg) {
                    //     },
                    //     'modal:hide': function(dlg) {
                    //     },
                    //     'dataview:focus': function(e){
                    //     },
                    //     'dataview:blur': function(e){
                    //     },
                    //     'menu:show': function(e){
                    //     },
                    //     'menu:hide': function(e){
                    //     },
                    //     'edit:complete': _.bind(me.onEditComplete, me)
                    // });

                } else {
                    // clearTimeout(optsFold.timer);
                    optsFold.$bar.removeClass('folded z-clear');
                    optsFold.$box.off();

                    var active_panel = optsFold.$box.find('.panel.active');
                    if ( active_panel.length ) {
                        var tab = active_panel.data('tab');
                        me.$tabs.find('> a[data-tab=' + tab + ']').parent().toggleClass('active', true);
                    } else {
                        tab = me.$tabs.siblings(':not(.x-lone):visible').first().find('> a[data-tab]').data('tab');
                        me.setTab(tab);
                    }
                }
            },

            collapse: function() {
                Common.UI.Menu.Manager.hideAll();
                // clearTimeout(optsFold.timer);

                if ( this.isFolded && optsFold.$bar ) {
                    optsFold.$bar.removeClass('expanded');
                    optsFold.$bar.find('.tabs .ribtab').removeClass('active');
                }
                this.fireEvent('tab:collapse');
            },

            expand: function() {
                // clearTimeout(optsFold.timer);

                optsFold.$bar.removeClass('z-clear');
                optsFold.$bar.addClass('expanded');
                // optsFold.timer = setTimeout(this.collapse, optsFold.timeout);
            },

            onResizeTabs: function(e) {
                if ( this.hasTabInvisible() ) {
                    if ( !$boxTabs.parent().hasClass('short') ) {
                        $boxTabs.parent().addClass('short');
                        setScrollButtonsDisabeled();
                    }
                } else
                if ( $boxTabs.parent().hasClass('short') ) {
                    $boxTabs.parent().removeClass('short');
                }
            },

            onResize: function(e) {
                this.onResizeTabs();
                this.hideMoreBtns();
                this.processPanelVisible();
            },

            onTabClick: function (e) {
                var me = this;
                var $target = $(e.currentTarget);
                var tab = $target.find('> a[data-tab]').data('tab');
                if ($target.hasClass('x-lone')) {
                    me.isFolded && me.collapse();
                } else {
                    if ( $target.hasClass('active') ) {
                        if (!me._timerSetTab) {
                            me.dblclick_el = tab;
                            if ( me.isFolded ) {
                                me.collapse();
                                setTimeout(function(){
                                    me.dblclick_el = undefined;
                                }, 500);
                            }
                        }
                    } else {
                        me._timerSetTab = true;
                        setTimeout(function(){
                            me._timerSetTab = false;
                        }, 500);
                        me.setTab(tab);
                        // me.processPanelVisible();
                        if ( !me.isFolded ) {
                            if ( me.dblclick_timer ) clearTimeout(me.dblclick_timer);
                            me.dblclick_timer = setTimeout(function () {
                                me.dblclick_el = tab;
                                delete me.dblclick_timer;
                            },500);
                        } else
                            me.dblclick_el = tab;
                    }
                }
            },

            setTab: function (tab) {
                var me = this;
                if ( !tab ) {
                    // onShowFullviewPanel.call(this, false);

                    if ( this.isFolded ) { this.collapse(); }
                    else tab = this.lastPanel;
                }

                if ( tab ) {
                    me.$tabs.removeClass('active');
                    me.$panels.removeClass('active');
                    me.hideMoreBtns();

                    var panel = this.$panels.filter('[data-tab=' + tab + ']');
                    if ( panel.length ) {
                        this.lastPanel = tab;
                        panel.addClass('active');
                        me.setMoreButton(tab, panel);
                        me.processPanelVisible(null, true);
                    }

                    if ( panel.length ) {
                        if ( me.isFolded ) me.expand();
                    } else {
                        // onShowFullviewPanel.call(this, true);
                        if ( me.isFolded ) me.collapse();
                    }

                    var $tp = this.$tabs.find('> a[data-tab=' + tab + ']').parent();
                    if ( $tp.length ) {
                        $tp.addClass('active');
                    }

                    this.fireEvent('tab:active', [tab]);
                    Common.NotificationCenter.trigger('tab:active',[tab]);
                }
            },

            addTab: function (tab, panel, after) {
                function _get_tab_action(index) {
                    if (!config.tabs[index])
                        return _get_tab_action(--index);

                    return config.tabs[index].action;
                }

                var _tabTemplate = _.template('<li class="ribtab" style="display: none;" <% if (typeof layoutname == "string") print(" data-layout-name=" + \' \' +  layoutname) + \' \' %>><a role="tab" id="<%= action %>" data-tab="<%= action %>" data-title="<%= caption %>" data-hint="0" data-hint-direction="bottom" data-hint-offset="small" <% if (typeof dataHintTitle !== "undefined") { %> data-hint-title="<%= dataHintTitle %>" <% } %> ><%= caption %></a></li>');

                config.tabs[after + 1] = tab;
                var _after_action = _get_tab_action(after);

                var _elements = this.$tabs || this.$layout.find('.tabs');
                var $target = _elements.find('a[data-tab=' + _after_action + ']');
                if ( $target.length ) {
                    $target.parent().after( _tabTemplate(tab) );

                    if (panel) {
                        _elements = this.$panels || this.$layout.find('.box-panels > .panel');
                        $target = _elements.filter('[data-tab=' + _after_action + ']');

                        if ($target.length) {
                            $target.after(panel);
                        } else {
                            panel.appendTo(this.$layout.find('.box-panels'));
                        }
                    }

                    // synchronize matched elements
                    this.$tabs && (this.$tabs = $boxTabs.find('> li'));
                    this.$panels && (this.$panels = this.$el.find('.box-panels > .panel'));
                }
            },

            getTab: function(tab) {
                if (tab && this.$panels) {
                    var panel = this.$panels.filter('[data-tab=' + tab + ']');
                    return panel.length ? panel : undefined;
                }
            },

            createTab: function(tab, visible) {
                if (!tab.action || !tab.caption) return;

                var _panel = $('<section id="' + tab.action + '" class="panel" data-tab="' + tab.action + '"></section>');
                this.addTab(tab, _panel, this.getLastTabIdx());
                this.setVisible(tab.action, !!visible);
                return _panel;
            },

            getMorePanel: function(tab) {
                return tab && btnsMore[tab] ? btnsMore[tab].panel : null;
            },

            getLastTabIdx: function() {
                return config.tabs.length;
            },

            isCompact: function () {
                return this.isFolded;
            },

            isExpanded: function () {
                return !this.isFolded || optsFold.$bar && optsFold.$bar.hasClass('expanded');
            },

            hasTabInvisible: function() {
                if ($boxTabs.length<1) return false;

                var _left_bound_ = Math.round($boxTabs.offset().left),
                    _right_bound_ = Math.round(_left_bound_ + $boxTabs.width());

                var tab = this.$tabs.filter(Common.UI.isRTL() ? ':visible:last' : ':visible:first').get(0);
                if ( !tab ) return false;

                var rect = tab.getBoundingClientRect();

                if ( !(Math.round(rect.left) < _left_bound_) ) {
                    tab = this.$tabs.filter(Common.UI.isRTL() ? ':visible:first' : ':visible:last').get(0);
                    rect = tab.getBoundingClientRect();

                    if (!(Math.round(rect.right) > _right_bound_))
                        return false;
                }

                return true;
            },

            /**
             * in case panel partly visible.
             * hide button's caption to decrease panel width
             * ##adopt-panel-width
            **/
            processPanelVisible: function(panel, force) {
                var me = this;
                function _fc() {
                    var $active = panel || me.$panels.filter('.active');
                    if ( $active && $active.length ) {
                        var _maxright = $active.parents('.box-controls').width(),
                            _staticPanelWidth = $active.parents('.box-controls').find('.panel.static').outerWidth();
                        if (!_staticPanelWidth) _staticPanelWidth = 0;
                        var data = $active.data(),
                            _rightedge = data.rightedge,
                            _btns = data.buttons,
                            _flex = data.flex;
                        var more_section = $active.find('.more-box');
                        if (more_section.length===0) {
                            me.setMoreButton($active.attr('data-tab'), $active);
                        }
                        if ( !_rightedge ) {
                            _rightedge = $active.outerWidth() + _staticPanelWidth;
                        }
                        if ( !_btns ) {
                            _btns = [];
                            _.each($active.find('.btn-slot .x-huge'), function(item) {
                                _btns.push($(item).closest('.btn-slot'));
                            });
                            btnsMore[data.tab] && btnsMore[data.tab].panel && _.each(btnsMore[data.tab].panel.find('.btn-slot .x-huge'), function(item) {
                                _btns.push($(item).closest('.btn-slot'));
                            });
                            data.buttons = _btns;
                        }
                        if (!_flex) {
                            _flex = [];
                            _.each($active.find('.group.flex'), function(item) {
                                var el = $(item);
                                _flex.push({el: el, width: el.attr('data-group-width') || el.attr('max-width')}); //save flex element and it's initial width
                            });
                            data.flex = _flex;
                        }

                        if (_rightedge > _maxright) {
                            if (!more_section.is(':visible') ) {
                                if (_flex.length>0) {
                                    for (var i=0; i<_flex.length; i++) {
                                        var item = _flex[i].el;
                                        _rightedge = $active.outerWidth() + _staticPanelWidth;
                                        if (Math.floor(item.outerWidth()) > parseInt(item.css('min-width'))) {
                                            data.rightedge = _rightedge;
                                            return;
                                        } else
                                            item.css('width', item.css('min-width'));
                                    }
                                }
                                for (var i=_btns.length-1; i>=0; i--) {
                                    var btn = _btns[i];
                                    if ( !btn.hasClass('compactwidth') && !btn.hasClass('slot-btn-more')) {
                                        btn.addClass('compactwidth');
                                        _rightedge = $active.outerWidth() + _staticPanelWidth;
                                        if (_rightedge <= _maxright)
                                            break;
                                    }
                                }
                                data.rightedge = _rightedge;
                            }
                            me.resizeToolbar(force);
                        } else {
                            more_section.is(':visible') && me.resizeToolbar(force);
                            if (!more_section.is(':visible')) {
                                for (var i=0; i<_btns.length; i++) {
                                    var btn = _btns[i];
                                    if ( btn.hasClass('compactwidth') ) {
                                        btn.removeClass('compactwidth');
                                        _rightedge = $active.outerWidth() + _staticPanelWidth;
                                        if (_rightedge > _maxright) {
                                            btn.addClass('compactwidth');
                                            _rightedge = $active.outerWidth() + _staticPanelWidth;
                                            break;
                                        }
                                    }
                                }
                                data.rightedge = _rightedge;
                                if (_flex.length>0 && $active.find('.btn-slot.compactwidth').length<1) {
                                    for (var i=0; i<_flex.length; i++) {
                                        var item = _flex[i],
                                            checkedwidth;
                                        if (item.el.find('.combo-dataview').hasClass('auto-width')) {
                                            checkedwidth = Common.UI.ComboDataView.prototype.checkAutoWidth(item.el,
                                                me.$boxpanels.width() - $active.outerWidth() + item.el.width());
                                        }
                                        item.el.css('width', checkedwidth ? (checkedwidth + parseFloat(item.el.css('padding-left')) + parseFloat(item.el.css('padding-right'))) + 'px' : item.width);
                                        data.rightedge = $active.get(0).getBoundingClientRect().right;
                                    }
                                }
                            }
                        }
                    }
                };

                if (!me._timer_id) {
                    _fc();
                    me._needProcessPanel = false;
                    me._timer_id =  setInterval(function() {
                        if (me._needProcessPanel) {
                            _fc();
                            me._needProcessPanel = false;
                        } else {
                            clearInterval(me._timer_id);
                            delete me._timer_id;
                        }
                    }, 100);
                } else
                    me._needProcessPanel = true;
            },
            /**/

            setExtra: function (place, el) {
                if ( !!el ) {
                    if (this.$tabs) {
                    } else {
                        if (place == 'right') {
                            this.$layout.find('.extra.right').html(el);
                        } else if (place == 'left') {
                            this.$layout.find('.extra.left').html(el);
                        }
                    }
                }
            },

            setVisible: function (tab, visible) {
                if ( tab && this.$tabs ) {
                    this.$tabs.find('> a[data-tab=' + tab + ']').parent().css('display', visible ? '' : 'none');
                    this.onResize();
                }
            },

            setMoreButton: function(tab, panel) {
                var me = this;
                if (!btnsMore[tab]) {
                    var top = panel.position().top;
                    var box = $('<div class="more-box" style="top:'+ top +'px;">' +
                        '<div class="separator long" style="position: relative;display: table-cell;"></div>' +
                        '<div class="group" style=""><span class="btn-slot text x-huge slot-btn-more"></span></div>' +
                        '</div>');
                    panel.append(box);
                    btnsMore[tab] = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top dropdown-manual',
                        caption: Common.Locale.get("textMoreButton",{name:"Common.Translation", default: "More"}),
                        iconCls: 'toolbar__icon btn-big-more',
                        enableToggle: true
                    });
                    btnsMore[tab].render(box.find('.slot-btn-more'));
                    btnsMore[tab].on('toggle', function(btn, state, e) {
                        (state) ? me.onMoreShow(btn, e) : me.onMoreHide(btn, e);
                        Common.NotificationCenter.trigger('more:toggle', btn, state);
                    });
                    var moreContainer = $('<div class="dropdown-menu more-container" data-tab="' + tab + '"><div style="display: inline;"></div></div>');
                    optsFold.$bar.append(moreContainer);
                    btnsMore[tab].panel = moreContainer.find('div');
                }
                this.$moreBar = btnsMore[tab].panel;
            },

            clearMoreButton: function(tab) {
                var panel = this.$panels.filter('[data-tab=' + tab + ']');
                if ( panel.length ) {
                    var data = panel.data();
                    data.buttons = data.flex = data.rightedge = data.leftedge = undefined;
                    panel.find('.more-box').remove();
                }
                if (btnsMore[tab]) {
                    var moreContainer = optsFold.$bar.find('.more-container[data-tab="' + tab + '"]');
                    moreContainer.remove();
                    btnsMore[tab].remove();
                    delete btnsMore[tab];
                }
            },

            clearActiveData: function(tab) {
                var panel = tab ? this.$panels.filter('[data-tab=' + tab + ']') : this.$panels.filter('.active');
                if ( panel.length ) {
                    var data = panel.data();
                    data.buttons = data.flex = data.rightedge = data.leftedge = undefined;
                }
            },

            addCustomItems: function(tab, added, removed) {
                if (!tab.action) return;

                var $panel = tab.action ? this.getTab(tab.action) || this.createTab(tab, true) || this.getTab('plugins') : null,
                    $morepanel = this.getMorePanel(tab.action),
                    $moresection = $panel ? $panel.find('.more-box') : null,
                    compactcls = '';
                ($moresection.length<1) && ($moresection = null);
                if ($panel) {
                    if (removed) {
                        removed.forEach(function(button, index) {
                            if (button.cmpEl) {
                                var group = button.cmpEl.closest('.group');
                                button.cmpEl.closest('.btn-slot').remove();
                                if (group.children().length<1) {
                                    var in_more = group.closest('.more-container').length>0;
                                    in_more ? group.next('.separator').remove() : group.prev('.separator').remove();
                                    group.remove();
                                    if (in_more && $morepanel.children().filter('.group').length === 0) {
                                        btnsMore[tab.action] && btnsMore[tab.action].isActive() && btnsMore[tab.action].toggle(false);
                                        $moresection && $moresection.css('display', "none");
                                    }
                                }
                            }
                        });
                        $panel.find('.btn-slot:not(.slot-btn-more).x-huge').last().hasClass('compactwidth') && (compactcls = 'compactwidth');
                    }
                    added && added.forEach(function(button, index) {
                        var _groups, _group;
                        if ($morepanel) {
                            _groups = $morepanel.children().filter('.group');
                            if (_groups.length>0) {
                                $moresection = null;
                                $panel = $morepanel;
                                compactcls = 'compactwidth';
                            }
                        }
                        if (!_groups || _groups.length<1)
                            _groups = $panel.children().filter('.group');

                        if (_groups.length>0 && !button.options.separator && index>0) // add first button to new group
                            _group = $(_groups[_groups.length-1]);
                        else {
                            if (button.options.separator) {
                                var el = $('<div class="separator long"></div>');
                                $moresection ? $moresection.before(el) : el.appendTo($panel);
                            }
                            _group = $('<div class="group"></div>');
                            $moresection ? $moresection.before(_group) : _group.appendTo($panel);
                        }
                        var $slot = $('<span class="btn-slot text x-huge ' + (!(button.options.caption || '').trim() ? 'nocaption ' : ' ') + compactcls + '"></span>').appendTo(_group);
                        button.render($slot);
                    });
                }
                this.clearActiveData(tab.action);
                this.processPanelVisible(null, true);

                var visible = !this.isTabEmpty(tab.action) && Common.UI.LayoutManager.isElementVisible('toolbar-' + tab.action);
                this.setVisible(tab.action, visible);
                if (!visible && this.isTabActive(tab.action) && this.isExpanded()) {
                    if (this.getTab('home'))
                        this.setTab('home');
                    else {
                        tab = this.$tabs.siblings(':not(.x-lone):visible').first().find('> a[data-tab]').data('tab');
                        this.setTab(tab);
                    }
                }
            },

            isTabEmpty: function(tab) {
                var $panel = this.getTab(tab),
                    $morepanel = this.getMorePanel(tab),
                    $moresection = $panel ? $panel.find('.more-box') : null;
                ($moresection.length<1) && ($moresection = null);
                return $panel ? !($panel.find('> .group').length>0 || $morepanel && $morepanel.find('.group').length>0) : false;
            },

            resizeToolbar: function(reset) {
                var $active = this.$panels.filter('.active'),
                    more_section = $active.find('.more-box');

                if (more_section.length===0) {
                    this.setMoreButton($active.attr('data-tab'), $active);
                }

                var more_section_width = parseInt(more_section.css('width')) || 0,
                    box_controls_width = $active.parents('.box-controls').width(),
                    _staticPanelWidth = $active.parents('.box-controls').find('.panel.static').outerWidth(),
                    _maxright = box_controls_width;
                if (!_staticPanelWidth) _staticPanelWidth = 0;
                var _rightedge = $active.outerWidth() + _staticPanelWidth,
                    delta = (this._prevBoxWidth) ? (_maxright - this._prevBoxWidth) : -1,
                    hideAllMenus = false;
                this._prevBoxWidth = _maxright;
                more_section.is(':visible') && (_maxright -= more_section_width);

                if (this.$moreBar && this.$moreBar.parent().is(':visible')) {
                    this.$moreBar.parent().css('max-width', Common.Utils.innerWidth());
                }

                if ( (reset || delta<0) && (_rightedge > _maxright)) { // from toolbar to more section
                    if (!more_section.is(':visible') ) {
                        more_section.css('display', "block");
                        _maxright -= parseInt(more_section.css('width'));
                    }
                    var last_separator = null,
                        last_group = null,
                        prevchild = this.$moreBar.children().filter("[data-hidden-tb-item!=true]");
                    if (prevchild.length>0) {
                        prevchild = $(prevchild[0]);
                        if (prevchild.hasClass('separator'))
                            last_separator = prevchild;
                        if (prevchild.hasClass('group') && prevchild.attr('group-state') == 'open')
                            last_group = prevchild;
                    }
                    var items = $active.find('> div:not(.more-box)');
                    var need_break = false;
                    for (var i=items.length-1; i>=0; i--) {
                        var item = $(items[i]);
                        if (!item.is(':visible') && !item.attr('hidden-on-resize')) { // move invisible items as is and set special attr
                            item.attr('data-hidden-tb-item', true);
                            this.$moreBar.prepend(item);
                            hideAllMenus = true;
                        } else if (item.hasClass('group')) {
                            //_rightedge = $active.get(0).getBoundingClientRect().right;
                            _rightedge = $active.outerWidth() + _staticPanelWidth;
                            if (_rightedge <= _maxright) // stop moving items
                                break;

                            var rect = item.get(0).getBoundingClientRect(),
                                item_width = item.outerWidth(),
                                children = item.children();
                            if (!item.attr('inner-width') && item.attr('group-state') !== 'open') {
                                item.attr('inner-width', item_width);
                                for (var j=children.length-1; j>=0; j--) {
                                    var child = $(children[j]);
                                    child.attr('inner-width', child.outerWidth());
                                }
                            }
                            if (((rect.left > _maxright || Common.UI.isRTL() && box_controls_width - rect.right > _maxright) || children.length==1) && item.attr('group-state') != 'open') {
                                // move group
                                this.$moreBar.prepend(item);
                                if (last_separator) {
                                    last_separator.css('display', '');
                                    last_separator.removeAttr('hidden-on-resize');
                                }
                                hideAllMenus = true;
                            } else if ((Common.UI.isRTL() ? box_controls_width - rect.right : rect.left)+item_width > _maxright ) {
                                // move buttons from group
                                for (var j=children.length-1; j>=0; j--) {
                                    var child = $(children[j]);
                                    if (child.hasClass('elset')) {
                                        this.$moreBar.prepend(item);
                                        if (last_separator) {
                                            last_separator.css('display', '');
                                            last_separator.removeAttr('hidden-on-resize');
                                        }
                                        hideAllMenus = true;
                                        break;
                                    } else {
                                        var child_rect = child.get(0).getBoundingClientRect(),
                                            child_width = child.outerWidth();
                                        if ((Common.UI.isRTL() ? box_controls_width - child_rect.right : child_rect.left)+child_width>_maxright) {
                                            if (!last_group) {
                                                last_group = $('<div></div>');
                                                last_group.addClass(items[i].className);
                                                var attrs = items[i].attributes;
                                                for (var k = 0; k < attrs.length; k++) {
                                                    last_group.attr(attrs[k].name, attrs[k].value);
                                                }
                                                this.$moreBar.prepend(last_group);
                                                if (last_separator) {
                                                    last_separator.css('display', '');
                                                    last_separator.removeAttr('hidden-on-resize');
                                                }
                                            }
                                            last_group.prepend(child);
                                            hideAllMenus = true;
                                        } else {
                                            need_break = true;
                                            break;
                                        }
                                    }
                                }
                                if (item.children().length<1) { // all buttons are moved
                                    item.remove();
                                    last_group && last_group.removeAttr('group-state').attr('inner-width', item.attr('inner-width'));
                                    last_group = null;
                                } else {
                                    last_group && last_group.attr('group-state', 'open') && item.attr('group-state', 'open');
                                }
                                if (need_break)
                                    break;
                            } else {
                                break;
                            }
                            last_separator = null;
                        } else if (item.hasClass('separator')) {
                            this.$moreBar.prepend(item);
                            item.css('display', 'none');
                            item.attr('hidden-on-resize', true);
                            last_separator = item;
                            hideAllMenus = true;
                        }
                    }
                } else if ((reset || delta>0) && more_section.is(':visible')) {
                    var last_separator = null,
                        last_group = null,
                        prevchild = $active.find('> div:not(.more-box)');
                    var last_width = 0;
                    if (prevchild.length>0) {
                        prevchild = $(prevchild[prevchild.length-1]);
                        if (prevchild.hasClass('separator')) {
                            last_separator = prevchild;
                            last_width = parseInt(last_separator.css('margin-left')) + parseInt(last_separator.css('margin-right')) + 1;
                        }
                        if (prevchild.hasClass('group') && prevchild.attr('group-state') == 'open')
                            last_group = prevchild;
                    }

                    var items = this.$moreBar.children();
                    if (items.length>0) {
                        // from more panel to toolbar
                        for (var i=0; i<items.length; i++) {
                            var item = $(items[i]);
                            _rightedge = $active.outerWidth() + _staticPanelWidth;
                            if (!item.is(':visible') && item.attr('data-hidden-tb-item')) { // move invisible items as is
                                item.removeAttr('data-hidden-tb-item');
                                more_section.before(item);
                                if (this.$moreBar.children().filter('.group').length == 0) {
                                    this.hideMoreBtns();
                                    more_section.css('display', "none");
                                }
                            } else if (item.hasClass('group')) {
                                var islast = false;
                                if (this.$moreBar.children().filter('.group').length == 1) {
                                    _maxright = box_controls_width; // try to move last group
                                    islast = true;
                                }

                                var item_width = parseInt(item.attr('inner-width') || 0);
                                if (_rightedge + last_width + item_width < _maxright && item.attr('group-state') != 'open') {
                                    // move group
                                    more_section.before(item);
                                    if (last_separator) {
                                        last_separator.css('display', '');
                                        last_separator.removeAttr('hidden-on-resize');
                                    }
                                    if (this.$moreBar.children().filter('.group').length == 0) {
                                        this.hideMoreBtns();
                                        more_section.css('display', "none");
                                    }
                                    hideAllMenus = true;
                                } else if ( _rightedge + last_width < _maxright) {
                                    // move buttons from group
                                    var children = item.children();
                                    _maxright = box_controls_width - more_section_width;
                                    for (var j=0; j<children.length; j++) {
                                        if (islast && j==children.length-1)
                                             _maxright = box_controls_width; // try to move last item from last group
                                        _rightedge = $active.outerWidth() + _staticPanelWidth;
                                        var child = $(children[j]);
                                        if (child.hasClass('elset')) { // don't add group - no enough space
                                            need_break = true;
                                            break;
                                        } else {
                                            var child_width = parseInt(child.attr('inner-width') || 0) + (!last_group ? parseInt(item.css('padding-left')) : 0); // if new group is started add left-padding
                                            if (_rightedge+last_width+child_width < _maxright) {
                                                if (!last_group) {
                                                    last_group = $('<div></div>');
                                                    last_group.addClass(items[i].className);
                                                    var attrs = items[i].attributes;
                                                    for (var k = 0; k < attrs.length; k++) {
                                                        last_group.attr(attrs[k].name, attrs[k].value);
                                                    }
                                                    if (last_group.hasClass('flex')) { // need to update flex groups list
                                                        $active.data().flex = null;
                                                    }
                                                    more_section.before(last_group);
                                                    if (last_separator) {
                                                        last_separator.css('display', '');
                                                        last_separator.removeAttr('hidden-on-resize');
                                                    }
                                                }
                                                last_group.append(child);
                                                hideAllMenus = true;
                                            } else {
                                                need_break = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (item.children().length<1) { // all buttons are moved
                                        item.remove();
                                        last_group && last_group.removeAttr('group-state').attr('inner-width', item.attr('inner-width'));
                                        last_group = null;
                                        if (this.$moreBar.children().filter('.group').length == 0) {
                                            this.hideMoreBtns();
                                            more_section.css('display', "none");
                                        }
                                    } else {
                                        last_group && last_group.attr('group-state', 'open') && item.attr('group-state', 'open');
                                    }
                                    if (need_break)
                                        break;
                                } else {
                                    break;
                                }
                                last_separator = null; last_width = 0;
                            } else if (item.hasClass('separator')) {
                                more_section.before(item);
                                item.css('display', 'none');
                                item.attr('hidden-on-resize', true);
                                last_separator = item;
                                last_width = parseInt(last_separator.css('margin-left')) + parseInt(last_separator.css('margin-right')) + 1;
                                hideAllMenus = true;
                            }
                        }
                    } else {
                        this.hideMoreBtns();
                        more_section.css('display', "none");
                    }
                }
                hideAllMenus && Common.UI.Menu.Manager.hideAll();
            },

            onMoreHide: function(btn, e) {
                var moreContainer = btn.panel.parent();
                if (btn.pressed) {
                    btn.toggle(false, true);
                }
                if (moreContainer.is(':visible')) {
                    moreContainer.hide();
                    Common.NotificationCenter.trigger('edit:complete', this.toolbar, btn);
                }
            },

            onMoreShow: function(btn, e) {
                var moreContainer = btn.panel.parent(),
                    parentxy = moreContainer.parent().offset(),
                    target = btn.$el,
                    showxy = target.offset(),
                    right = Common.Utils.innerWidth() - (showxy.left - parentxy.left + target.width()),
                    top = showxy.top - parentxy.top + target.height() + 10;

                var styles = Common.UI.isRTL() ? {left: '6px', right: 'auto', top : top, 'max-width': Common.Utils.innerWidth() + 'px'} : {right: right, left: 'auto', top : top, 'max-width': Common.Utils.innerWidth() + 'px'}
                moreContainer.css(styles);
                moreContainer.show();
            },

            hideMoreBtns: function() {
                for (var btn in btnsMore) {
                    btnsMore[btn] && btnsMore[btn].isActive() && btnsMore[btn].toggle(false);
                }
            }
        };
    }()));
});
