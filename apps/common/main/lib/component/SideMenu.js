/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  SideMenu.js
 *
 *  Created by Julia Svinareva on 25/10/2023.
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'underscore',
    'backbone',
    'common/main/lib/component/BaseView'
], function (_, Backbone) {
    'use strict';

    Common.UI.SideMenu = Backbone.View.extend((function () {
        return {
            buttons: [],
            btnMoreContainer: undefined,

            render: function () {
                this.btnMore = new Common.UI.Button({
                    parentEl: this.btnMoreContainer,
                    cls: 'btn-side-more btn-category',
                    iconCls: 'toolbar__icon btn-more',
                    onlyIcon: true,
                    style: 'width: 100%;',
                    hint: this.tipMore,
                    menu: new Common.UI.Menu({
                        cls: 'shifted-right',
                        items: []
                    })
                });
                this.btnMore.menu.on('item:click', _.bind(this.onMenuMore, this));

                $(window).on('resize', _.bind(this.setMoreButton, this));
            },

            setButtons: function (buttons) {
                this.buttons = buttons;
            },

            addButton: function (button) {
                this.buttons.push(button);
            },

            insertButton: function (button, $button) {
                this.btnMoreContainer.before($button);
                button.on('click', _.bind(function () {
                    this.fireEvent('button:click', [button]);
                }, this));
                this.addButton(button);
                this.setMoreButton();
            },

            insertPanel: function ($panel) {
                this.$el.find('.side-panel').append($panel);
            },

            setMoreButton: function () {
                var $more = this.btnMoreContainer;

                var btnHeight = this.buttons[0].cmpEl.outerHeight(true),
                    padding = parseFloat(this.$el.find('.tool-menu-btns').css('padding-top')),
                    height = padding + this.buttons.length * btnHeight,
                    maxHeight = this.$el.height();

                if (height > maxHeight) {
                    var arrMore = [],
                        last,
                        i;
                    height = padding;
                    for (i = 0; i < this.buttons.length; i++) {
                        height += btnHeight;
                        if (height > maxHeight) {
                            last = i - 1;
                            break;
                        }
                    }
                    this.buttons.forEach(function (btn, index) {
                        if (index >= last) {
                            if (btn.options.iconImg) {
                                arrMore.push({
                                    caption: btn.hint,
                                    iconImg: btn.options.iconImg,
                                    template: _.template([
                                        '<a id="<%= id %>" class="menu-item">',
                                        '<img class="menu-item-icon" src="<%= options.iconImg %>">',
                                        '<%= caption %>',
                                        '</a>'
                                    ].join('')),
                                    value: index
                                })
                            } else {
                                arrMore.push({
                                    caption: btn.hint,
                                    iconCls: btn.iconCls,
                                    value: index,
                                    disabled: btn.isDisabled()
                                });
                            }
                            btn.cmpEl.hide();
                        } else {
                            btn.cmpEl.show();
                        }
                    });
                    if (arrMore.length > 0) {
                        this.btnMore.menu.removeAll();
                        for (i = 0; i < arrMore.length; i++) {
                            this.btnMore.menu.addItem(arrMore[i]);
                        }
                        $more.show();
                    }
                } else {
                    this.buttons.forEach(function (btn) {
                        btn.cmpEl.show();
                    });
                    $more.hide();
                }
            },

            onMenuMore: function (menu, item) {
                var btn = this.buttons[item.value];
                btn.toggle(!btn.pressed);
                btn.trigger('click', btn);
            },

            setDisabledMoreMenuItem: function (btn, disabled) {
                if (this.btnMore && !btn.cmpEl.is(':visible')) {
                    var index =_.indexOf(this.buttons, btn),
                        item = _.findWhere(this.btnMore.menu.items, {value: index})
                    item.setDisabled(disabled);
                }
            },

            setDisabledAllMoreMenuItems: function (disabled) {
                if (this.btnMore && this.btnMore.menu.items.length > 0) {
                    this.btnMore.menu.items.forEach(function (item) {
                        item.setDisabled(disabled);
                    });
                }
            },

            setDisabledPluginButtons: function (disabled) {
                var me = this;
                this.buttons.forEach(function (btn) {
                    if (btn.options.type === 'plugin') {
                        btn.setDisabled(disabled);
                        me.setDisabledMoreMenuItem(btn, disabled);
                    }
                });
            },

            getPluginButton: function (guid) {
                var btn;
                for (var i=0; i<this.buttons.length; i++) {
                    if (this.buttons[i].options.value === guid) {
                        btn = this.buttons[i];
                        break;
                    }
                }
                return [btn, i];
            },

            openPlugin: function (guid) {
                var btn = this.getPluginButton(guid)[0];
                if (btn) {
                    if (!btn.isDisabled() && !btn.pressed) {
                        btn.toggle(true);
                        this.fireEvent('button:click', [btn]);
                    }
                }
            },

            closePlugin: function (guid) {
                var arr = this.getPluginButton(guid),
                    btn = arr[0],
                    index = arr[1];
                btn.cmpEl.parent().remove();
                this.buttons.splice(index, 1);
                this.close();

                this.setMoreButton();
            },
        }
    }()));
});
