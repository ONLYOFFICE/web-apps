/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *  PdfSavedSignatureMenu.js
 *
 *  Created on 15/06/26
 *
 */

define([], function () { 'use strict';
    Common.Views.PdfSavedSignatureMenu = _.extend({

        getSavedSignature: function() {
            var storedJson = Common.localStorage.getItem('dialog-signature-saved');
            if (!storedJson) return null;

            var data = JSON.parse(storedJson);
            return data && data.signatureImage ? data : null;
        },

        removeSavedSignature: function() {
            Common.localStorage.removeItem('dialog-signature-saved');
        },

        getMenuContainer: function(rootEl, menu) {
            return menu ? rootEl.find(Common.Utils.String.format('#menu-container-{0}', menu.id)) : null;
        },

        createMenuContainer: function(rootEl, menu) {
            var menuContainer = this.getMenuContainer(rootEl, menu);
            if (!menuContainer || menuContainer.length < 1) {
                menuContainer = $(Common.Utils.String.format(
                    '<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>',
                    menu.id
                ));
                rootEl.append(menuContainer);
            }
            return menuContainer;
        },

        hideMenu: function(rootEl, menu) {
            var menuContainer = this.getMenuContainer(rootEl, menu);
            if (menu) menu.hide();
            menuContainer && menuContainer.hide();
        },

        syncMenu: function(menu, storedSignature) {
            menu.items[0].options.signatureData = storedSignature;
            menu.items[0].options.signatureImage = storedSignature ? storedSignature.signatureImage : '';
            menu.items[0].cmpEl && menu.items[0].cmpEl.find('img').attr('src', storedSignature ? storedSignature.signatureImage : '');
        },

        createMenu: function(rootEl, options) {
            var menu = new Common.UI.Menu({
                menuAlign: 'tl-bl',
                style: 'width: 200px;',
                items: [
                    {
                        cls: 'pdf-saved-signature-menu-item',
                        value: 'saved',
                        signatureData: options.storedSignature,
                        signatureImage: options.storedSignature ? options.storedSignature.signatureImage : '',
                        deleteCaption: this.txtDeleteSavedSignature,
                        template: _.template([
                            '<a id="<%= id %>" class="menu-item pdf-saved-signature-item" data-no-icon tabindex="-1" type="menuitem">',
                                '<div class="pdf-saved-signature-preview">',
                                    '<img class="pdf-saved-signature-img" src="<%- options.signatureImage %>">',
                                '</div>',
                            '</a>',
                            '<span class="signature-delete pdf-saved-signature-delete" role="button" tabindex="-1" data-toggle="tooltip" aria-label="<%- options.deleteCaption %>"></span>'
                        ].join(''))
                    },
                    {
                        caption: this.txtCreateNewSignature,
                        value: 'new',
                        template: _.template([
                            '<a id="<%= id %>" class="menu-item signature-create-new pdf-saved-signature-create" data-no-icon tabindex="-1" type="menuitem">',
                                '<span class="pdf-saved-signature-create-icon"></span><%- caption %>',
                            '</a>'
                        ].join(''))
                    }
                ]
            });
            var menuContainer = this.createMenuContainer(rootEl, menu);

            menu.on('item:click', function(menu, item) {
                if (item.value === 'saved' && item.options.signatureData) {
                    options.onApply && options.onApply(item.options.signatureData, menu);
                } else if (item.value === 'new') {
                    options.onCreateNew && options.onCreateNew(menu);
                }
            });

            menu.render(menuContainer);
            menu.cmpEl.attr({tabindex: "-1"});
            var deleteButton = menu.items[0].cmpEl.find('.signature-delete');
            deleteButton.tooltip({ title: this.txtDeleteSavedSignature, placement: 'cursor', zIndex: 10001});
            deleteButton.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                deleteButton.tooltip('hide');
                options.onDelete && options.onDelete(menu);
            });
            menu.on('hide:after', function() {
                deleteButton.tooltip('hide');
                options.onHideAfter && options.onHideAfter(menu);
            });

            return {
                menu: menu,
                menuContainer: menuContainer
            };
        },

        showMenu: function(menuContainer, menu, x, y) {
            menuContainer.css({left: x, top : y}).show();
            menu.show();
            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
        },

        showActions: function(scope, obj, x, y, options) {
            options = options || {};

            var rootEl = options.rootEl,
                signProps = obj.asc_getSignatureProps(scope.api),
                storedSignature = this.getSavedSignature(),
                menu = scope.signatureControlMenu,
                me = this,
                uncheck = function() {
                    scope.api.asc_UncheckContentControlButtons();
                },
                closeMenu = function(currentMenu) {
                    me.hideMenu(rootEl, currentMenu);
                    uncheck();
                };

            if (!storedSignature) {
                options.openDialog && options.openDialog.call(scope, signProps);
                return;
            }

            scope.currentSignatureProps = signProps;
            scope._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                menu = this.createMenu(rootEl, {
                    storedSignature: storedSignature,
                    onApply: function(data, menu) {
                        options.applySignature && options.applySignature.call(scope, scope.currentSignatureProps, data);
                        closeMenu(menu);
                    },
                    onDelete: function(menu) {
                        me.removeSavedSignature();
                        closeMenu(menu);
                    },
                    onCreateNew: function(menu) {
                        closeMenu(menu);
                        _.defer(function() {
                            options.openDialog && options.openDialog.call(scope, scope.currentSignatureProps);
                        });
                    },
                    onHideAfter: function() {
                        if (!scope._fromShowContentControls)
                            uncheck();
                    }
                }).menu;
                scope.signatureControlMenu = menu;
            } else {
                this.syncMenu(menu, storedSignature);
            }

            var menuContainer = this.getMenuContainer(rootEl, menu);
            menuContainer.attr('data-value', 'prevent-canvas-click');
            scope._preventClick = true;
            this.showMenu(menuContainer, menu, x, y);
            scope._fromShowContentControls = false;
        },

        txtDeleteSavedSignature: 'Delete saved signature',
        txtCreateNewSignature: 'Create a new signature'
    }, Common.Views.PdfSavedSignatureMenu || {});
});
