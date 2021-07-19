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
 *    TabBar.js
 *
 *    Created by Maxim Kadushkin on 28 March 2014
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Tab'
], function () {
    'use strict';

    var Events = {
        bind: function () {
            if (!this.o) this.o = $({});
            this.o.on.apply(this.o, arguments);
        },
        unbind: function () {
            if (this.o) this.o.off.apply(this.o, arguments);
        },
        trigger: function () {
            if (!this.o) this.o = $({});
            this.o.trigger.apply(this.o, arguments);
        }
    };

    var StateManager = function (options) {
        this.initialize.call(this, options);
    };

    _.extend(StateManager.prototype, Events);

    StateManager.prototype.initialize = function (options) {
        this.bar = options.bar;
    };

    StateManager.prototype.attach = function (tab) {
        tab.changeState = $.proxy(function (select) {
            if (select) {
                tab.toggleClass('selected');
                var selectTab = _.find(this.bar.selectTabs, function (item) {return item.sheetindex === tab.sheetindex;});
                if (selectTab) {
                    this.bar.selectTabs = _.without(this.bar.selectTabs, selectTab);
                } else {
                    this.bar.selectTabs.push(tab);
                }
            } else {
                if (!tab.isSelected()) {
                    this.bar.$el.find('ul > li.selected').removeClass('selected');
                    tab.addClass('selected');
                    this.bar.selectTabs.length = 0;
                    this.bar.selectTabs.push(tab);
                }
                this.trigger('tab:change', tab);
                this.bar.$el.find('ul > li.active').removeClass('active');
                tab.activate();

                this.bar.trigger('tab:changed', this.bar, this.bar.tabs.indexOf(tab), tab);
            }
        }, this);

        var dragHelper = new (function() {

            return {
                bounds: [],
                drag: undefined,

                calculateBounds: function () {
                    var me = this,
                        length = me.bar.tabs.length,
                        barBounds = me.bar.$bar.get(0).getBoundingClientRect();
                    me.leftBorder = barBounds.left;
                    me.rightBorder = barBounds.right;

                    if (barBounds) {
                        me.bounds       = [];
                        me.scrollLeft   = me.bar.$bar.scrollLeft();
                        me.bar.scrollX  = this.scrollLeft;

                        for (var i = 0; i < length; ++i) {
                            this.bounds.push(me.bar.tabs[i].$el.get(0).getBoundingClientRect());
                        }

                        me.lastTabRight = me.bounds[length - 1].right;

                        me.tabBarLeft   = me.bounds[0].left;
                        me.tabBarRight  = me.bounds[length - 1].right;
                        me.tabBarRight  = Math.min(me.tabBarRight, barBounds.right - 1);
                    }
                },

                setHookTabs: function (e, bar, tabs) {
                    var me = this;
                    function dragComplete() {
                        if (!_.isUndefined(me.drag)) {
                            bar.dragging = false;
                            bar.$el.find('li.mousemove').removeClass('mousemove right');
                            var arrSelectIndex = [];
                            tabs.forEach(function (item) {
                                arrSelectIndex.push(item.sheetindex);
                            });
                            if (!_.isUndefined(me.drag.place)) {
                                me.bar.trigger('tab:move', arrSelectIndex, me.drag.place);
                                me.bar.$bar.scrollLeft(me.scrollLeft);
                                me.bar.scrollX = undefined;
                            } else {
                                me.bar.trigger('tab:move', arrSelectIndex);
                                me.bar.$bar.scrollLeft(me.scrollLeft);
                                me.bar.scrollX = undefined;
                            }
                            me.bar.checkInvisible();

                            me.drag  = undefined;
                            me.bar.trigger('tab:drop', this);
                        }
                    }
                    function dragMove (event) {
                        if (!_.isUndefined(me.drag)) {
                            me.drag.moveX = event.clientX*Common.Utils.zoom();
                           if (me.drag.moveX < me.leftBorder) {
                                me.scrollLeft -= 20;
                                me.bar.$bar.scrollLeft(me.scrollLeft);
                                me.calculateBounds();
                           } else if (me.drag.moveX < me.tabBarRight && me.drag.moveX > me.tabBarLeft) {
                                var name = $(event.target).parent().data('label'),
                                    currentTab = _.findIndex(bar.tabs, {label: name});
                                if (currentTab === -1) {
                                    bar.$el.find('li.mousemove').removeClass('mousemove right');
                                    me.drag.place = undefined;
                                } else if (me.bounds[currentTab].left - me.scrollLeft >= me.tabBarLeft) {
                                    me.drag.place = currentTab;
                                    $(event.target).parent().parent().find('li.mousemove').removeClass('mousemove right');
                                    $(event.target).parent().addClass('mousemove');
                                }
                           } else if (me.drag.moveX > me.lastTabRight && Math.abs(me.tabBarRight - me.bounds[me.bar.tabs.length - 1].right) < 1) { //move to end of list, right border of the right tab is visible
                                bar.$el.find('li.mousemove').removeClass('mousemove right');
                                bar.tabs[bar.tabs.length - 1].$el.addClass('mousemove right');
                                me.drag.place = bar.tabs.length;
                           } else if (me.drag.moveX - me.rightBorder > 3) {
                               me.scrollLeft += 20;
                               me.bar.$bar.scrollLeft(me.scrollLeft);
                               me.calculateBounds();
                           }
                        }
                    }
                    if (!_.isUndefined(bar) && !_.isUndefined(tabs) && bar.tabs.length > 1) {
                        me.bar      = bar;
                        me.drag     = {tabs: tabs};
                        bar.dragging = true;
                        this.calculateBounds();

                        $(document).on('mousemove.tabbar', dragMove);
                        $(document).on('mouseup.tabbar', function (e) {
                            dragComplete(e);
                            $(document).off('mouseup.tabbar');
                            $(document).off('mousemove.tabbar', dragMove);
                        });
                        this.bar.trigger('tab:drag', this.bar.selectTabs);
                    }
                }
            }
        });

        tab.$el.on({
            click: $.proxy(function (event) {
                if (!tab.disabled) {
                    if (event.ctrlKey || event.metaKey) {
                        if (!tab.isActive()) {
                            tab.changeState(true);
                        }
                    } else if (event.shiftKey) {
                        this.bar.$el.find('ul > li.selected').removeClass('selected');
                        this.bar.selectTabs.length = 0;
                        var $active = this.bar.$el.find('ul > li.active'),
                            indexAct = $active.index(),
                            indexCur = this.bar.tabs.indexOf(tab);
                        var startIndex = (indexCur > indexAct) ? indexAct : indexCur,
                            endIndex = (indexCur > indexAct) ? indexCur : indexAct;
                        for (var i = startIndex; i <= endIndex; i++) {
                            this.bar.tabs[i].changeState(true);
                        }
                    } else if (!tab.$el.hasClass('active')) {
                        if (this.bar.tabs.length === this.bar.selectTabs.length) {
                            this.bar.$el.find('ul > li.selected').removeClass('selected');
                            this.bar.selectTabs.length = 0;
                        }
                        if (tab.control == 'manual') {
                            this.bar.trigger('tab:manual', this.bar, this.bar.tabs.indexOf(tab), tab);
                        } else {
                            tab.changeState();
                            if (this.bar.isEditFormula)
                                setTimeout(function(){
                                    $('#ce-cell-content').focus();
                                    var $cellContent = $('#ce-cell-content')[0];
                                    $cellContent.selectionStart = $cellContent.selectionEnd = $cellContent.value.length;
                                }, 500);
                        }
                    }
                }
                !tab.disabled && Common.NotificationCenter.trigger('edit:complete', 'tab');
            }, this),
            dblclick: $.proxy(function() {
                this.trigger('tab:dblclick', this, this.tabs.indexOf(tab), tab);
            }, this.bar),
            contextmenu: $.proxy(function () {
                this.trigger('tab:contextmenu', this, this.tabs.indexOf(tab), tab, this.selectTabs);
            }, this.bar),
            mousedown: $.proxy(function (e) {
                if ((3 !== e.which) && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    var lockDrag = tab.isLockTheDrag;
                    this.bar.selectTabs.forEach(function (item) {
                        if (item.isLockTheDrag) {
                            lockDrag = true;
                        }
                    });
                    if (this.bar.selectTabs.length === this.bar.tabs.length || this.bar.tabs.length === 1 || this.bar.isEditFormula) {
                        lockDrag = true;
                    }
                    this.bar.$el.find('ul > li > span').attr('draggable', !lockDrag);
                    if (!lockDrag)
                        tab.changeState();
                } else {
                    this.bar.$el.find('ul > li > span').attr('draggable', 'false');
                }
                if ($('#ce-cell-content').is(':focus'))
                    if (!this.bar.isEditFormula) {
                        $('#ce-cell-content').blur();
                    } else {
                        setTimeout(function () {
                            $('#ce-cell-content').focus();
                        }, 500)
                    }
            }, this)
        });
        tab.$el.children().on(
            {dragstart: $.proxy(function (e) {
                var event = e.originalEvent;
                if (!Common.Utils.isIE) {
                    var img = document.createElement('div');
                    event.dataTransfer.setDragImage(img, 0, 0);
                } else {
                    this.bar.selectTabs.forEach(function (tab) {
                        tab.$el.find('span').prop('title', '');
                    });
                }
                event.dataTransfer.effectAllowed = 'move';
                this.bar.trigger('tab:dragstart', event.dataTransfer, this.bar.selectTabs);
            }, this),
            dragenter: $.proxy(function (e) {
                var event = e.originalEvent;
                if (!this.bar.isEditFormula) {
                    this.bar.$el.find('.mousemove').removeClass('mousemove right');
                    $(e.currentTarget).parent().addClass('mousemove');
                    var data;
                    if (!Common.Utils.isIE) {
                        data = event.dataTransfer.getData('onlyoffice');
                        event.dataTransfer.dropEffect = data ? 'move' : 'none';
                    } else {
                        data = event.dataTransfer.getData('text');
                        event.dataTransfer.dropEffect = data === 'sheet' ? 'move' : 'none';
                    }
                } else {
                    event.dataTransfer.dropEffect = 'none';
                }
            }, this),
            dragover: $.proxy(function (e) {
                var event = e.originalEvent;
                if (event.preventDefault) {
                    event.preventDefault(); // Necessary. Allows us to drop.
                }
                if (!this.bar.isEditFormula) {
                    this.bar.$el.find('.mousemove').removeClass('mousemove right');
                    $(e.currentTarget).parent().addClass('mousemove');
                } else {
                    event.dataTransfer.dropEffect = 'none';
                }
                return false;
            }, this),
            dragleave: $.proxy(function (e) {
                $(e.currentTarget).parent().removeClass('mousemove right');
            }, this),
            dragend: $.proxy(function (e) {
                var event = e.originalEvent;
                if (event.dataTransfer.dropEffect === 'move') {
                    this.bar.trigger('tab:dragend', true);
                } else {
                    this.bar.trigger('tab:dragend', false);
                }
                this.bar.$el.find('.mousemove').removeClass('mousemove right');
            }, this),
            drop: $.proxy(function (e) {
                var event = e.originalEvent,
                    index = $(event.currentTarget).data('index');
                this.bar.$el.find('.mousemove').removeClass('mousemove right');
                this.bar.trigger('tab:drop', event.dataTransfer, index);
                this.bar.isDrop = true;
            }, this)
        });
    };

    StateManager.prototype.detach = function (tab) {
        tab.$el.off();
    };

    Common.UI.TabBar = Common.UI.BaseView.extend({
        config: {
            placement   : 'top',
            items       : [],
            draggable   : false
        },

        tabs: [],
        template: _.template('<ul id="statusbar_bottom" class="nav nav-tabs <%= placement %>"></ul>'),
        selectTabs: [],

        initialize : function (options) {
            _.extend(this.config, options);
            Common.UI.BaseView.prototype.initialize.call(this, options);

            this.saved = [];
        },

        render: function () {
            this.$el.html(this.template(this.config));
            this.$bar = this.$el.find('ul');

            var addEvent = function( elem, type, fn ) {
                elem.addEventListener ? elem.addEventListener( type, fn, false ) : elem.attachEvent( "on" + type, fn );
            };

            var eventname=(/Firefox/i.test(navigator.userAgent))? 'DOMMouseScroll' : 'mousewheel';
            addEvent(this.$bar[0], eventname, _.bind(this._onMouseWheel,this));
            addEvent(this.$bar[0], 'dragstart', _.bind(function (event) {
                event.dataTransfer.effectAllowed = 'move';
            }, this));
            addEvent(this.$bar[0], 'dragenter', _.bind(function (event) {
                var data;
                if (!Common.Utils.isIE) {
                    data = event.dataTransfer.getData('onlyoffice');
                    event.dataTransfer.dropEffect = (!this.isEditFormula && data) ? 'move' : 'none';
                } else {
                    data = event.dataTransfer.getData('text');
                    event.dataTransfer.dropEffect = (data === 'sheet' && !this.isEditFormula) ? 'move' : 'none';
                }
            }, this));
            addEvent(this.$bar[0], 'dragover', _.bind(function (event) {
                if (event.preventDefault) {
                    event.preventDefault(); // Necessary. Allows us to drop.
                }
                event.dataTransfer.dropEffect = !this.isEditFormula ? 'move' : 'none';
                !this.isEditFormula && this.tabs[this.tabs.length - 1].$el.addClass('mousemove right');
                return false;
            }, this));
            addEvent(this.$bar[0], 'dragleave', _.bind(function (event) {
                event.dataTransfer.dropEffect = 'none';
                this.tabs[this.tabs.length - 1].$el.removeClass('mousemove right');
            }, this));
            addEvent(this.$bar[0], 'drop', _.bind(function (event) {
                this.$el.find('.mousemove').removeClass('mousemove right');
                if (this.isDrop === undefined) {
                    this.trigger('tab:drop', event.dataTransfer, 'last');
                } else {
                    this.isDrop = undefined;
                }
            }, this));

            this.manager = new StateManager({bar: this});

            this.insert(-1, this.config.items);
            this.insert(-1, this.saved);
            delete this.saved;

            Common.Gateway.on('processmouse', _.bind(this.onProcessMouse, this));

            this.rendered = true;
            return this;
        },

        _onMouseWheel: function(e) {
            var hidden  = this.checkInvisible(true),
                forward = ((e.detail && -e.detail) || e.wheelDelta) < 0;

            if (forward) {
                if (hidden.last) {
                    this.setTabVisible('forward');
                }
            } else {
                if (hidden.first) {
                    this.setTabVisible('backward');
                }
            }
        },

        onProcessMouse: function(data) {
            if (data.type == 'mouseup' && this.dragging) {
                var tab = this.getActive(true);
                if (tab)
                    tab.mouseup();
            }
        },

        add: function(tabs) {
            return this.insert(-1, tabs) > 0;
        },

        insert: function(index, tabs) {
            var count = 0;
            if (tabs) {
                if (!(tabs instanceof Array)) tabs = [tabs];

                if (tabs.length) {
                    count = tabs.length;

                    if (this.rendered) {
                        var me = this, tab;

                        if (index < 0 || index > me.tabs.length) {
                            for (var i = 0; i < tabs.length; i++) {
                                tab = new Common.UI.Tab(tabs[i]);
                                me.$bar.append(tab.render().$el);
                                me.tabs.push(tab);
                                me.manager.attach(tab);
                                if (tab.isActive()) {
                                    me.selectTabs.length = 0;
                                    me.selectTabs.push(tab);
                                }
                            }
                        } else {
                            for (i = tabs.length; i-- > 0 ; ) {
                                tab = new Common.UI.Tab(tabs[i]);

                                if (index === 0) {
                                    me.$bar.prepend(tab.render().$el);
                                    me.tabs.unshift(tab);
                                } else {
                                    me.$bar.find('li:nth-child(' + index + ')').before(tab.render().$el);
                                    me.tabs.splice(index, 0, tab);
                                }

                                if (tab.isActive()) {
                                    me.selectTabs.length = 0;
                                    me.selectTabs.push(tab);
                                }

                                me.manager.attach(tab);
                            }
                        }
                    } else {
                        this.saved.push(tabs)
                    }

                    this.checkInvisible();
                }
            }

            return count;
        },

        remove: function(index) {
            if (index >= 0 && index < this.tabs.length) {
                var tab = this.tabs.splice(index, 1)[0];
                this.manager.detach(tab);
                tab.$el.remove();
                this.checkInvisible();
            }
        },

        empty: function(suppress) {
            var me = this;
            this.tabs.forEach(function(tab){
                me.manager.detach(tab);
            });

            this.$bar.empty();
            me.tabs = [];

            this.checkInvisible(suppress);
        },

        setActive: function(t) {
            if (t instanceof Common.UI.Tab) {
                tab = t;
            } else
            if (typeof t == 'number') {
                if (t >= 0 && t < this.tabs.length) {
                    var tab = this.tabs[t];
                }
            }

            if(tab && tab.control != 'manual' && !tab.disabled && !tab.$el.hasClass('active')){
                tab.changeState();
            }

            this.checkInvisible();
        },

        setSelectAll: function(isSelect) {
            var me = this;
            me.selectTabs.length = 0;
            if (isSelect) {
                me.tabs.forEach(function(tab){
                    if (!tab.isSelected()) {
                        tab.addClass('selected');
                    }
                    me.selectTabs.push(tab);
                });
            } else {
                me.tabs.forEach(function(tab){
                    if (tab.isActive()) {
                        me.selectTabs.push(tab);
                    } else if (tab.isSelected()) {
                        tab.removeClass('selected');
                    }
                });
            }
        },

        getActive: function(iselem) {
            return iselem ? this.$bar.find('> li.active') : this.$bar.find('> li.active').index();
        },

        getAt: function(index) {
            return (index >= 0 && index < this.tabs.length) ? this.tabs[index] : undefined;
        },

        getCount: function() {
            return this.tabs.length;
        },

        addClass: function(cls) {
            if (cls.length && !this.$bar.hasClass(cls))
                this.$bar.addClass(cls);
        },

        removeClass: function(cls) {
            if (cls.length && this.$bar.hasClass(cls))
                this.$bar.removeClass(cls);
        },

        hasClass: function(cls) {
            return this.$bar.hasClass(cls);
        },

        setTabVisible: function(index, suppress) {
            if (index <= 0 || index == 'first') {
                this.$bar.scrollLeft(0);
                this.checkInvisible(suppress);
            } else if ( index >= (this.tabs.length - 1) || index == 'last') {
                var tab = this.tabs[this.tabs.length-1].$el;
                if (this.$bar.find('.separator-item').length === 0) {
                    this.$bar.append('<li class="separator-item"><span></span></li>');
                }
                this.$bar.scrollLeft(this.$bar.scrollLeft() + (tab.position().left + parseInt(tab.css('width')) - this.$bar.width()) + (this.$bar.width() > 400 ? 20 : 5));
                this.checkInvisible(suppress);
            } else {
                if (!this.isTabVisible(this.tabs.length - 1) && this.$bar.find('.separator-item').length === 0) {
                    this.$bar.append('<li class="separator-item"><span></span></li>');
                }
                var rightbound = this.$bar.width(),
                    tab, right, left;
                if (index == 'forward') {
                    for (var i = 0; i < this.tabs.length; i++) {
                        tab = this.tabs[i].$el;
                        right = tab.position().left + parseInt(tab.css('width'));

                        if (right > rightbound) {
                            this.$bar.scrollLeft(this.$bar.scrollLeft() + (right - rightbound) + (this.$bar.width() > 400 ? 20 : 5));
                            this.checkInvisible(suppress);
                            break;
                        }
                    }
                } else if (index == 'backward') {
                    for (i = this.tabs.length; i-- > 0; ) {
                        tab = this.tabs[i].$el;
                        left = tab.position().left;

                        if (left < 0) {
                            this.$bar.scrollLeft(this.$bar.scrollLeft() + left - 26);
                            this.checkInvisible(suppress);
                            break;
                        }
                    }
                } else if (typeof index == 'number') {
                    tab = this.tabs[index].$el;
                    left = tab.position().left;
                    right = left + parseInt(tab.css('width'));

                    if (left < 0) {
                        this.$bar.scrollLeft(this.$bar.scrollLeft() + left - 26);
                        this.checkInvisible(suppress);
                    } else if (right > rightbound) {
                        this.$bar.scrollLeft(this.$bar.scrollLeft() + (right - rightbound) + 20);
                        this.checkInvisible(suppress);
                    }
                }
            }
        },

        checkInvisible: function(suppress) {
            var result = {
                first: !this.isTabVisible(0),
                last: !this.isTabVisible(this.tabs.length-1)
            };

            !suppress && this.fireEvent('tab:invisible', this, result);
            return result;
        },

        hasInvisible: function() {
            var _left_bound_ = this.$bar.offset().left,
                _right_bound_ = _left_bound_ + this.$bar.width();

            for (var i = this.tabs.length; i-- > 0; ) {
                if (!this.isTabVisible(i, _left_bound_, _right_bound_)) {
                    return true;
                }
            }

            return false;
        },

        isTabVisible: function(index) {
            var leftbound = arguments[1] || this.$bar.offset().left,
                rightbound = arguments[2] || (leftbound + this.$bar.width()),
                left, right, tab, rect;

            if (index < this.tabs.length && index >= 0) {
                tab = this.tabs[index].$el;
                rect = tab.get(0).getBoundingClientRect();
                left = rect.left;
                right = rect.right;

                //left = tab.position().left;
                //right = left + tab.width();

                return !(left < leftbound) && !(right - rightbound > 0.5);
            }

            return false;
        }
    });
});
