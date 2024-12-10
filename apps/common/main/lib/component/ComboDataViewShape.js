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
 *  ComboDataView.js
 *
 *  Created on 6/10/21
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/component/DataView'
], function () {
    'use strict';

    Common.UI.ComboDataViewShape = Common.UI.BaseView.extend({
        options : {
            id                  : null,
            cls                 : '',
            style               : '',
            hint                : false,
            itemWidth           : 80,
            itemHeight          : 40,
            menuMaxHeight       : 300,
            enableKeyEvents     : false,
            additionalMenuItems  : null,
            minWidth: -1,
            dataHint: '',
            dataHintDirection: '',
            dataHintOffset: ''
        },

        template: _.template([
            '<div id="<%= id %>" class="combo-dataview <%= cls %>" style="<%= style %>">',
            '<div class="view"></div> ',
            '<div class="button"></div> ',
            '</div>'
        ].join('')),

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

            this.id          = this.options.id || Common.UI.getId();
            this.cls         = this.options.cls;
            this.style       = this.options.style;
            this.hint        = this.options.hint;
            this.store       = this.options.store || new Common.UI.DataViewStore();
            this.itemWidth   = this.options.itemWidth;
            this.itemHeight  = this.options.itemHeight;
            this.menuMaxHeight = this.options.menuMaxHeight;
            this.menuWidth = this.options.menuWidth;
            this.rootWidth   = 0;
            this.rootHeight  = 0;
            this.rendered    = false;
            this.needFillComboView = false;
            this.minWidth = this.options.minWidth;
            this.delayRenderTips = this.options.delayRenderTips || false;

            this.fieldPicker = new Common.UI.DataView({
                cls: 'field-picker',
                allowScrollbar: false,
                itemTemplate: _.template('<div class="item-shape" id="<%= id %>" data-shape="<%= data.shapeType %>"><svg width="20" height="20" class=\"icon uni-scale\"><use xlink:href=\"#svg-icon-<%= data.shapeType %>\"></use></svg></div>'),
                delayRenderTips: this.delayRenderTips
            });

            this.openButton = new Common.UI.Button({
                cls: 'open-menu',
                menu: new Common.UI.Menu({
                    cls: 'menu-insert-shape',
                    menuAlign: 'tl-tl',
                    offset: [0, 3],
                    items: [
                        {template: _.template('<div class="menu-picker-container"></div>')}
                    ]
                }),
                dataHint: this.options.dataHint,
                dataHintDirection: this.options.dataHintDirection,
                dataHintOffset: this.options.dataHintOffset
            });

            // Handle resize
            setInterval(_.bind(this.checkSize, this), 500);

            if (this.options.el) {
                this.render();
            }
        },

        fillComboView: function (collection) {
            var groups = collection.toJSON(),
                recents = Common.localStorage.getItem(this.appPrefix + 'recent-shapes');
            recents = recents ? JSON.parse(recents) : [];

            // check lang
            if (recents.length > 0) {
                var isTranslated = _.findWhere(groups, {groupName: recents[0].groupName});
                if (!isTranslated) {
                    for (var r = 0; r < recents.length; r++) {
                        var type = recents[r].data.shapeType,
                            record;
                        for (var g = 0; g < groups.length; g++) {
                            var store = groups[g].groupStore,
                                groupName = groups[g].groupName;
                            for (var i = 0; i < store.length; i++) {
                                if (store.at(i).get('data').shapeType === type) {
                                    record = store.at(i).toJSON();
                                    recents[r] = {
                                        data: record.data,
                                        tip: record.tip,
                                        allowSelected: record.allowSelected,
                                        selected: false,
                                        groupName: groupName
                                    };
                                    break;
                                }
                            }
                            if (record) {
                                record = undefined;
                                break;
                            }
                        }
                    }
                    Common.localStorage.setItem(this.appPrefix + 'recent-shapes', JSON.stringify(recents));
                }
            }

            if (recents.length < 12) {
                var count = 12 - recents.length;

                var addItem = function (rec) {
                    var item = rec.toJSON(),
                        model = {
                            data: item.data,
                            tip: item.tip,
                            allowSelected: item.allowSelected,
                            selected: false
                        };
                    recents.push(model);
                };

                for (var j = 0; j < groups.length && count > 0; j++) {
                    var groupStore = groups[j].groupStore;
                    if (j === 0) {
                        addItem(groupStore.at(1));
                        count--;
                        if (count > 0) {
                            addItem(groupStore.at(2));
                            count--;
                        }
                    } else if (j !== 3 && j !== 6 && j !== 7) {
                        addItem(groupStore.at(0));
                        count--;
                        if (count > 0) {
                            addItem(groupStore.at(1));
                            count--;
                        }
                    }
                }
            }

            this.fieldPicker.store.reset(recents);

            this.fieldPicker.on('item:select', _.bind(this.onFieldPickerSelect, this));
            this.fieldPicker.on('item:click',  _.bind(this.onFieldPickerClick, this));
            this.fieldPicker.on('item:contextmenu', _.bind(this.onPickerItemContextMenu, this));
            this.fieldPicker.el.addEventListener('contextmenu', _.bind(this.onPickerComboContextMenu, this), false);
        },

        setMenuPicker: function (collection, recent, text) {
            this.menuPicker  = new Common.UI.DataViewShape({
                el: this.cmpEl.find('.menu-picker-container'),
                cls: 'menu-picker',
                parentMenu: this.openButton.menu,
                restoreHeight: this.menuMaxHeight,
                style: 'max-height: '+this.menuMaxHeight+'px;',
                itemTemplate : _.template('<div class="item-shape" id="<%= id %>"><svg width="20" height="20" class=\"icon uni-scale\"><use xlink:href=\"#svg-icon-<%= data.shapeType %>\"></use></svg></div>'),
                groups: collection,
                textRecentlyUsed: text,
                recentShapes: recent
            });

            this.menuPicker.on('item:select',  _.bind(this.onMenuPickerSelect, this));
            this.menuPicker.on('item:click',   _.bind(this.onMenuPickerClick, this));
            this.menuPicker.on('item:contextmenu',  _.bind(this.onPickerItemContextMenu, this));
            this.menuPicker.el.addEventListener('contextmenu', _.bind(this.onPickerComboContextMenu, this), false);

            this.onResize();
        },

        render: function(parentEl) {
            if (!this.rendered) {
                var me = this;

                me.trigger('render:before', me);

                me.cmpEl = me.$el || $(me.el);

                var templateEl = me.template({
                    id      : me.id,
                    cls     : me.cls,
                    style   : me.style
                });

                if (parentEl) {
                    me.setElement(parentEl, false);

                    me.cmpEl = $(templateEl);

                    parentEl.html(me.cmpEl);
                } else {
                    me.cmpEl.html(templateEl);
                }

                me.rootWidth  = me.cmpEl.width();
                me.rootHeight = me.cmpEl.height();

                me.fieldPicker.render($('.view', me.cmpEl));
                me.openButton.render($('.button', me.cmpEl));
                //me.menuPicker.render($('.menu-picker-container', me.cmpEl));

                if (me.openButton.menu.cmpEl) {
                    if (me.openButton.menu.cmpEl) {
                        me.openButton.menu.menuAlignEl = me.cmpEl;
                        me.openButton.menu.cmpEl.css('min-width', me.itemWidth);
                        me.openButton.menu.on('show:before',          _.bind(me.onBeforeShowMenu, me));
                        me.openButton.menu.on('show:after',           _.bind(me.onAfterShowMenu, me));
                        me.openButton.cmpEl.on('hide.bs.dropdown',    _.bind(me.onBeforeHideMenu, me));
                        me.openButton.cmpEl.on('hidden.bs.dropdown',  _.bind(me.onAfterHideMenu, me));
                    }
                }

                if (me.options.hint) {
                    me.cmpEl.attr('data-toggle', 'tooltip');
                    me.cmpEl.tooltip({
                        title       : me.options.hint,
                        placement   : me.options.hintAnchor || 'cursor'
                    });
                }

                //me.onResize();

                me.rendered = true;

                me.trigger('render:after', me);
            }
            if (this.disabled) {
                this.setDisabled(!!this.disabled);
            }

            return this;
        },

        updateComboView: function (record) {
            var store = this.fieldPicker.store,
                type = record.get('data').shapeType,
                model = null;
            for (var i = 0; i < store.length; i++) {
                if (store.at(i).get('data').shapeType === type) {
                    model = store.at(i);
                    break;
                }
            }
            if (!model) {
                store.pop();
                store.unshift([record]);
            }
        },

        activateRecord: function (record) {
            var type = record.get('data').shapeType;
            if (this.isRecordActive)
                this.deactivateRecords();
            $(this.cmpEl.find("[data-shape='" + type + "']")).parent().addClass('active');
            this.isRecordActive = true;
        },

        deactivateRecords: function () {
            $(this.cmpEl.find('.field-picker .item')).removeClass('active');
        },

        isComboViewRecActive: function () {
            return this.isRecordActive;
        },

        checkSize: function() {
            if (this.cmpEl && this.cmpEl.is(':visible')) {
                var me = this,
                    width  = this.cmpEl.width(),
                    height = this.cmpEl.height();

                if (width < this.minWidth) return;

                if (this.rootWidth != width || this.rootHeight != height) {
                    this.rootWidth  = width;
                    this.rootHeight = height;
                    setTimeout(function() {
                        me.openButton.menu.cmpEl.outerWidth();
                        me.rootWidth = me.cmpEl.width();
                    }, 10);
                    this.onResize();
                }
            }
        },

        onResize: function() {
            if (this.openButton) {
                var button = $('button', this.openButton.cmpEl);
                var cntButton = $('.button', this.cmpEl);
                button && cntButton.width() > 0 && button.css({
                    width : cntButton.width(),
                    height: cntButton.height()
                });

                this.openButton.menu.hide();

                /*var picker = this.menuPicker;
                if (picker) {
                    var record = picker.getSelectedRec();
                    this.fillComboView(record || picker.store.at(0), !!record, true);

                    picker.onResize();
                }*/
            }

            if (!this.isSuspendEvents)
                this.trigger('resize', this);
        },

        onBeforeShowMenu: function(e) {
            var menu = this.openButton.menu;
            if (menu.cmpEl) {
                menu.menuAlignEl = this.cmpEl;
                var offset = this.cmpEl.width() - this.openButton.$el.width() - this.menuWidth + 1;
                if (Common.UI.isRTL()) {
                    offset = this.openButton.$el.width() - 1;
                }
                menu.setOffset(Common.UI.isRTL() ? offset : Math.min(offset, 0));
            }

            if (this.options.hint) {
                var tip = this.cmpEl.data('bs.tooltip');
                if (tip) {
                    if (tip.dontShow===undefined)
                        tip.dontShow = true;
                    tip.hide();
                }
            }
        },

        onBeforeHideMenu: function(e) {
            this.trigger('hide:before', this, e);

            if (Common.UI.Scroller.isMouseCapture())
                e.preventDefault();

            if (this.isStylesNotClosable)
                return false;
        },

        onAfterShowMenu: function(e) {
            var me = this;
            if (me.menuPicker.scroller) {
                me.menuPicker.scroller.update({
                    includePadding: true,
                    suppressScrollX: true,
                    alwaysVisibleY: true
                });
            }
        },

        onAfterHideMenu: function(e, isFromInputControl) {
            this.menuPicker.selectedBeforeHideRec = this.menuPicker.getSelectedRec(); // for DataView - onKeyDown - Return key
            this.menuPicker.deselectAll();
            this.trigger('hide:after', this, e, isFromInputControl);
        },

        onFieldPickerSelect: function(picker, item, record) {
            //
        },

        onMenuPickerSelect: function(picker, item, record, fromKeyDown) {
            this.needFillComboView = this.disabled;
            if (this.disabled || fromKeyDown===true) return;

            /*this.fillComboView(record, false);
            if (record && !this.isSuspendEvents)
                this.trigger('select', this, record);*/
        },

        onFieldPickerClick: function(dataView, item, record) {
            if (this.disabled) return;

            var isActive = item.$el.hasClass('active');

            if (!this.isSuspendEvents)
                this.trigger('click', this, record, isActive);

            if (this.options.hint) {
                var tip = this.cmpEl.data('bs.tooltip');
                if (tip) {
                    if (tip.dontShow===undefined)
                        tip.dontShow = true;
                    tip.hide();
                }
            }

            if (!isActive) {
                this.activateRecord(record);
            }
        },

        onMenuPickerClick: function(dataView, itemView, record) {
            if (this.disabled) return;

            if (!this.isSuspendEvents)
                this.trigger('click', this, record);

            this.activateRecord(record);
        },

        onPickerItemContextMenu: function(dataView, itemView, record, e) {
            if (this.disabled) return;

            if (!this.isSuspendEvents) {
                this.trigger('contextmenu', this, record, e);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        },

        onPickerComboContextMenu: function(mouseEvent) {
            if (this.disabled) return;

            if (!this.isSuspendEvents) {
                this.trigger('contextmenu', this, undefined, mouseEvent);
            }
        },

        setDisabled: function(disabled) {
            disabled = !!disabled;
            this.disabled = disabled;

            if (!this.rendered)
                return;

            this.cmpEl.toggleClass('disabled', disabled);
            $('button', this.openButton.cmpEl).toggleClass('disabled', disabled);
            this.fieldPicker.setDisabled(disabled);
        },

        isDisabled: function() {
            return this.disabled;
        }
    })
});