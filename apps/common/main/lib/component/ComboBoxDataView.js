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
 *  ComboBoxDataView.js
 *
 *  Created on 09/13/23
 *
 */

if (Common === undefined)
    var Common = {};

define([
], function () {
    'use strict';

    Common.UI.ComboBoxDataView = Common.UI.BaseView.extend((function() {
        return {
            options : {
                id          : null,
                cls         : '',
                style       : '',
                hint        : false,
                formTemplate: null,
                disabled    : false,
                menuCls     : '',
                menuStyle   : '',
                restoreHeight: 0,
                takeFocusOnClose: false,
                dataHint: '',
                dataHintDirection: '',
                dataHintOffset: ''
            },

            template: _.template([
                '<div class="input-group combobox combo-dataview-menu input-group-nr dropdown-toggle <%= cls %>" data-toggle="dropdown" id="<%= id %>" style="<%= style %>">',
                    '<%= formTemplate() %>',
                    '<div style="display: table-cell;"></div>',
                        '<button type="button" class="btn btn-default dropdown-toggle"><span class="caret"></span></button>',
                    '</div>',
            ].join('')),

            initialize : function(options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                var me = this;

                me.id             = me.options.id || Common.UI.getId();
                this.cls            = me.options.cls;
                this.style          = me.options.style;
                this.menuCls        = me.options.menuCls;
                this.menuStyle      = me.options.menuStyle;
                this.dataViewStyle  = me.options.dataViewStyle;
                this.dataViewCls    = me.options.dataViewCls;
                this.template       = me.options.template || me.template;
                this.itemTemplate   = me.options.itemTemplate;
                this.disabled       = me.options.disabled;
                this.groups         = me.options.groups         || null;
                this.store          = me.options.store || new Common.UI.DataViewStore();
                this.updateFormControl = me.options.updateFormControl;
                this.options.data && me.store.add(this.options.data);
                this.formTemplate   = this.options.formTemplate || _.template([
                    '<div class="form-control" style="width: 100px;" data-hint="<%= dataHint %>" data-hint-direction="<%= dataHintDirection %>" data-hint-offset="<%= dataHintOffset %>">',
                        '<i class="img-arrows"><svg><use xlink:href=""></use></svg></i>',
                    '</div>'
                ].join(''));

                me.rendered         = me.options.rendered || false;
                if (me.options.el) {
                    me.render();
                } else if (me.options.parentEl)
                    me.render(me.options.parentEl);
            },

            render : function(parentEl) {
                var me = this;

                if (!me.rendered) {
                    this.cmpEl = $(this.template({
                        id          : this.id,
                        cls         : this.cls,
                        style       : this.style,
                        formTemplate: this.formTemplate,
                        dataHintDirection: this.options.dataHintDirection,
                        dataHintOffset: this.options.dataHintOffset,
                        isRTL       : Common.UI.isRTL()
                    }));
                    if (parentEl) {
                        this.setElement(parentEl, false);
                        parentEl.html(this.cmpEl);
                    } else {
                        this.$el.html(this.cmpEl);
                    }
                } else {
                    this.cmpEl = me.$el || $(this.el);
                }

                if (!me.rendered) {
                    var el = this.cmpEl;
                    this._button = el.find('.btn');
                    this._formControl = el.find('.form-control');
                    Common.NotificationCenter.on('menumanager:hideall', _.bind(me.closeMenu, me));
                }
                me.getMenu();
                me.rendered = true;
                if (me.disabled) me.setDisabled(me.disabled);

                return this;
            },

            getMenu: function(options) {
                if (typeof this.menu !== 'object') {
                    options = options || this.options;

                    var id = Common.UI.getId(),
                        el = (this.$el || $(this.el)),
                        menu = (new Common.UI.Menu({
                            id: id,
                            cls: options.menuCls,
                            style: options.menuStyle,
                            additionalAlign: options.additionalAlign,
                            items: (options.additionalItems ? options.additionalItems : []).concat([
                                { template: _.template('<div id="' + id + '-data-menu" style="' + options.dataViewStyle + '" class="' + options.dataViewCls + '"></div>') }
                            ])
                        })).render(el);

                    this.dataPicker = new Common.UI.DataView({
                        el: el.find('#' + id + '-data-menu'),
                        parentMenu: menu,
                        outerMenu: {menu: menu, index: options.additionalItems ? options.additionalItems.length : 0, focusOnShow: !options.additionalItems},
                        groups: options.groups,
                        store: options.store,
                        itemTemplate: options.itemTemplate,
                        restoreHeight: options.restoreHeight,
                    });
                    this.dataPicker.on('item:click', _.bind(this.onClickItem, this));
                    menu.setInnerMenu([{menu: this.dataPicker, index: options.additionalItems ? options.additionalItems.length : 0}]);

                    var me = this;
                    menu.on('keydown:before', _.bind(this.onBeforeKeyDown, this));
                    menu.on('show:after', function(menu) {
                        me.dataPicker && _.delay(function() {
                            !options.additionalItems && me.dataPicker.focus();
                        }, 10);
                    }).on('hide:after', function() {
                        if (me.options.takeFocusOnClose) {
                            setTimeout(function(){me.focus();}, 1);
                        }
                    });
                    this.menu = menu;
                }
                return this.menu;
            },

            getPicker: function() {
                return this.dataPicker;
            },

            onClickItem: function(picker, view, record) {
                if (this.updateFormControl)
                    this.updateFormControl.call(this, record);
                if ( this.disabled || this.isSuspendEvents) return;
                this.trigger('item:click', this, picker, view, record);
            },

            selectRecord: function(record) {
                if (!this.rendered)
                    return;

                this.dataPicker && this.dataPicker.selectRecord(record, true);
                if (this.updateFormControl)
                    this.updateFormControl.call(this, record);
            },

            onBeforeKeyDown: function(menu, e) {
                if ((e.keyCode == Common.UI.Keys.DOWN || e.keyCode == Common.UI.Keys.SPACE) && !this.isMenuOpen()) {
                    $('button', this.cmpEl).click();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            },

            closeMenu: function() {
                (this.$el || $(this.el)).removeClass('open');
            },

            isMenuOpen: function() {
                return (this.$el || $(this.el)).hasClass('open');
            },

            setTabIndex: function(tabindex) {
                if (!this.rendered)
                    return;

                this.tabindex = tabindex.toString();
                !this.disabled && this._formControl.attr('tabindex', this.tabindex);
            },

            setDisabled: function(disabled) {
                disabled = !!disabled;
                this.disabled = disabled;

                if (!this.rendered)
                    return;

                if (this.tabindex!==undefined) {
                    disabled && (this.tabindex = this._formControl.attr('tabindex'));
                    this._formControl.attr('tabindex', disabled ? "-1" : this.tabindex);
                }
                this.cmpEl.toggleClass('disabled', disabled);
                this._button.toggleClass('disabled', disabled);
                this._formControl.toggleClass('disabled', disabled);
            },

            isDisabled: function() {
                return this.disabled;
            },

            focus: function() {
                this._formControl && this._formControl.focus();
            }
        }
    })());
});