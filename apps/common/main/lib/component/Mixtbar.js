/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  Created by Maxim.Kadushkin on 4/11/2017.
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone'
], function (Backbone) {
    'use strict';

    Common.UI.Mixtbar = Common.UI.BaseView.extend((function () {
        var $boxTabs;
        var $scrollL;
        var optsFold = {timeout: 2000};
        var config = {};

        var onScrollTabs = function(opts, e) {
            var sv = $boxTabs.scrollLeft();
            if ( sv || opts == 'right' ) {
                $boxTabs.animate({scrollLeft: opts == 'left' ? sv - 100 : sv + 100}, 200);
            }
        }

        function onTabDblclick(e) {
            this.fireEvent('change:compact', [$(e.target).data('tab')]);
        }

        function onShowFullviewPanel(state) {
            this.collapseToolbar();

            if ( state )
                optsFold.$bar.addClass('cover'); else
                optsFold.$bar.removeClass('cover');
        }

        function onClickDocument(e) {
            if ( this.isFolded ) {
                if ( $(e.target).parents('.toolbar').length ){
                } else {
                    this.collapseToolbar();
                }
            }
        }

        return {
            $tabs: undefined,
            $panels: undefined,
            $marker: undefined,
            lastTab: undefined,
            isFolded: false,

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.$layout = $(options.template({
                    tabs: options.tabs
                }));

                config.tabs = options.tabs;
                $(document.body).on('click', onClickDocument.bind(this));
            },

            afterRender: function() {
                var me = this;

                $boxTabs = me.$('.tabs > ul');
                me.$tabs = $boxTabs.find('> li');
                me.$panels = me.$('.box-panels > .panel');
                me.$marker = me.$('.tabs .marker');
                var $scrollR = me.$('.tabs .scroll.right');
                $scrollL = me.$('.tabs .scroll.left');

                $scrollL.on('click', onScrollTabs.bind(this, 'left'));
                $scrollR.on('click', onScrollTabs.bind(this, 'right'));

                me.$tabs.on('dblclick', onTabDblclick.bind(this));
            },

            isTabActive: function(tag) {
                var t = this.$tabs.filter('.active').find('> a');
                return t.length && t.data('tab') == tag;
            },

            setFolded: function(value) {
                this.isFolded = value;

                var me = this;
                if ( this.isFolded ) {
                    if (!optsFold.$bar) optsFold.$bar = me.$el.find('.toolbar');
                    if (!optsFold.$box) optsFold.$box = me.$el.find('.box-controls');

                    optsFold.$bar.addClass('folded');
                    optsFold.$box.on({
                        mouseleave: function (e) {
                            optsFold.timer = setTimeout(me.collapseToolbar, optsFold.timeout);
                        },
                        mouseenter: function (e) {
                            clearTimeout(optsFold.timer);
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
                    clearTimeout(optsFold.timer);
                    optsFold.$bar.removeClass('folded');
                    optsFold.$box.off();
                }
            },

            collapseToolbar: function() {
                optsFold.$bar && optsFold.$bar.removeClass('expanded');
                Common.UI.Menu.Manager.hideAll();
            },

            expandToolbar: function() {
                clearTimeout(optsFold.timer);

                optsFold.$bar.addClass('expanded');
                optsFold.timer = setTimeout(this.collapseToolbar, optsFold.timeout);
            },

            onResize: function(e) {
                if ( this.hasTabInvisible() ) {
                    if ( !$boxTabs.parent().hasClass('short') )
                        $boxTabs.parent().addClass('short');
                } else
                if ( $boxTabs.parent().hasClass('short') ) {
                    $boxTabs.parent().removeClass('short');
                }
            },

            setTab: function (tab) {
                if (!tab || !tab.length) {
                    if ( this.isFolded ) onShowFullviewPanel.call(this, false);
                    else tab = this.lastPanel;
                }

                if ( tab ) {
                    this.$tabs.removeClass('active');
                    this.$panels.removeClass('active');

                    var panel = this.$panels.filter('[data-tab=' + tab + ']');
                    if ( panel.length ) {
                        this.lastPanel = tab;
                        panel.addClass('active');
                    }

                    var $tp = this.$tabs.find('> a[data-tab=' + tab + ']').parent();
                    if ( $tp.length ) {
                        $tp.addClass('active');

                        this.$marker.width($tp.width());

                        if ( $scrollL.is(':visible') )
                            this.$marker.css({left: $tp.position().left + $boxTabs.scrollLeft() - $scrollL.width()});
                        else this.$marker.css({left: $tp.position().left});
                    }

                    if ( this.isFolded ) {
                        if ( panel.length )
                            this.expandToolbar(); else
                            onShowFullviewPanel.call(this, true);
                    }
                }
            },

            addTab: function (tab, panel, after) {
                function _get_tab_action(index) {
                    if (!config.tabs[index])
                        return _get_tab_action(--index);

                    return config.tabs[index].action;
                }

                var _tabTemplate = _.template('<li class="ribtab"><a href="#" data-tab="<%= action %>" data-title="<%= caption %>"><%= caption %></a></li>');

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
                        }
                    }

                    // synchronize matched elements
                    this.$tabs && (this.$tabs = $boxTabs.find('> li'));
                    this.$panels && (this.$panels = this.$el.find('.box-panels > .panel'));
                }
            },

            isCompact: function () {
                return this.isFolded;
            },

            hasTabInvisible: function() {
                var _left_bound_ = $boxTabs.offset().left,
                    _right_bound_ = _left_bound_ + $boxTabs.width();

                var tab = this.$tabs.first().get(0);
                var rect = tab.getBoundingClientRect();

                if ( !(rect.left < _left_bound_) ) {
                    tab = this.$tabs.last().get(0);
                    rect = tab.getBoundingClientRect();

                    if (!(rect.right > _right_bound_))
                        return false;
                }

                return true;
            },

            setExtra: function (place, el) {
                if ( this.$tabs ) {
                } else {
                    if ( place == 'right' ) {
                        this.$layout.find('.extra.right').html(el);
                    } else
                    if ( place == 'left' ) {
                        this.$layout.find('.extra.left').html(el);
                    }
                }
            }
        };
    }()));
});
