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
            if (!storedJson) return [];

            var data = JSON.parse(storedJson);
            return _.isArray(data) ? data : [];
        },

        addSavedSignature: function(data) {
            if (!data || !data.signatureImage) return;

            var signatures = this.getSavedSignature();
            signatures = _.filter(signatures, function(signature) {
                return signature.signatureImage !== data.signatureImage;
            });
            signatures.unshift(data);
            signatures = signatures.slice(0, 3);
            Common.localStorage.setItem('dialog-signature-saved', JSON.stringify(signatures));
        },

        getCurrentSignature: function(signProps) {
            var signatureId = signProps ? signProps.get_FormId() : '',
                storedJson = signatureId ? Common.localStorage.getItem('dialog-signature-' + signatureId) : null;

            if (!storedJson) return null;

            var data = JSON.parse(storedJson);
            return data && data.signatureImage ? data : null;
        },

        isSelectedSignature: function(data, currentSignature) {
            return !!(data && currentSignature && data.signatureImage === currentSignature.signatureImage);
        },

        removeSavedSignature: function(data) {
            if (!data || !data.signatureImage) return;

            var signatures = this.getSavedSignature();
            signatures = _.filter(signatures, function(signature) {
                return signature.signatureImage !== data.signatureImage;
            });

            if (signatures.length) Common.localStorage.setItem('dialog-signature-saved', JSON.stringify(signatures));
            else Common.localStorage.removeItem('dialog-signature-saved');
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

        syncMenu: function(menu, storedSignature, currentSignature) {
            var me = this,
                index = 0;

            _.each(menu.items, function(item) {
                if (item.value !== 'saved') return;

                var signature = storedSignature[index++];
                item.options.signatureData = signature || null;
                item.options.signatureImage = signature ? signature.signatureImage : '';

                if (!item.cmpEl) return;

                if (signature) item.cmpEl.show();
                else item.cmpEl.hide();

                item.cmpEl.find('img').attr('src', item.options.signatureImage);
                item.cmpEl.find('.pdf-saved-signature-preview').toggleClass(
                    'pdf-saved-signature-selected',
                    me.isSelectedSignature(signature, currentSignature)
                );
            });
        },

        createMenu: function(rootEl, options) {
            var me = this,
                items = [];

            for (var i = 0; i < 3; i++) {
                items.push({
                    cls: 'pdf-saved-signature-menu-item',
                    value: 'saved',
                    signatureData: null,
                    signatureImage: '',
                    deleteCaption: this.txtDeleteSavedSignature,
                    template: _.template([
                        '<a id="<%= id %>" class="menu-item pdf-saved-signature-item" data-no-icon tabindex="-1" type="menuitem">',
                            '<div class="pdf-saved-signature-preview">',
                                '<img class="pdf-saved-signature-img" src="<%- options.signatureImage %>">',
                            '</div>',
                        '</a>',
                        '<span class="signature-delete pdf-saved-signature-delete" role="button" tabindex="-1" data-toggle="tooltip" aria-label="<%- options.deleteCaption %>"></span>'
                    ].join(''))
                });
            }
            items.push({
                caption: this.txtCreateNewSignature,
                value: 'new',
                template: _.template([
                    '<a id="<%= id %>" class="menu-item signature-create-new pdf-saved-signature-create" data-no-icon tabindex="-1" type="menuitem">',
                        '<span class="pdf-saved-signature-create-icon"></span><%- caption %>',
                    '</a>'
                ].join(''))
            });

            var menu = new Common.UI.Menu({
                menuAlign: 'tl-bl',
                style: 'width: 200px;',
                items: items
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
            _.each(menu.items, function(item) {
                if (item.value !== 'saved')
                    return;

                var deleteButton = item.cmpEl.find('.signature-delete');
                deleteButton.tooltip({ title: me.txtDeleteSavedSignature, placement: 'cursor', zIndex: 10001});
                deleteButton.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    deleteButton.tooltip('hide');
                    options.onDelete && options.onDelete(item.options.signatureData, menu);
                });
            });
            menu.on('hide:after', function() {
                _.each(menu.items, function(item) {
                    if (item.value === 'saved')
                        item.cmpEl.find('.signature-delete').tooltip('hide');
                });
                options.onHideAfter && options.onHideAfter(menu);
            });

            this.syncMenu(menu, options.storedSignature, options.currentSignature);

            return {
                menu: menu,
                menuContainer: menuContainer
            };
        },

        getFieldRect: function(scope, signProps) {
            return signProps ? scope.api.asc_GetContentControlBoundingRect(signProps.get_FormId()) : null;
        },

        showMenu: function(rootEl, menuContainer, menu, fieldBounds) {
            var bounds = Common.Utils.getBoundingClientRect(rootEl.get(0)),
                height = bounds.height,
                bottom = bounds.bottom,
                menuOffset = 4,
                menuTolerance = 8,
                x = fieldBounds[0],
                y = fieldBounds[3],
                left = bounds.left + x,
                top = bounds.top + y;

            if (height && (fieldBounds[3] <= 0 || fieldBounds[1] >= height)) {
                menu.hide();
                menuContainer.hide();
                return false;
            }

            menu.menuAlign = 'tl-bl';
            menuContainer.css({left: x, top : y}).show();
            menu.show();
            var menuHeight = menu.cmpEl.outerHeight(),
                menuWidth = menu.cmpEl.outerWidth();

            if (top + menuHeight > bottom + menuTolerance) {
                top = bounds.top + fieldBounds[1] - menuOffset - menuHeight;
                if (top >= bounds.top) {
                    menu.menuAlign = 'bl-tl';
                } else {
                    menu.hide();
                    menuContainer.hide();
                    return false;
                }
            }

            if (left + menuWidth > bounds.right) left = bounds.right - menuWidth;
            if (left < bounds.left) left = bounds.left;

            menu.cmpEl.css({left: left, top: top});

            _.delay(function() {
                menu.cmpEl.focus();
            }, 10);
            return true;
        },

        updateMenuPosition: function(scope, rootEl) {
            var menu = scope.signatureControlMenu;
            if (!menu || (!menu.isVisible() && !scope.menuHidden)) return;

            var signProps = scope.currentSignatureProps,
                fieldBounds = this.getFieldRect(scope, signProps),
                menuContainer = this.getMenuContainer(rootEl, menu);

            if (!fieldBounds) {
                this.hideMenu(rootEl, menu);
                scope.menuHidden = true;
                return;
            }

            var menuShown = this.showMenu(rootEl, menuContainer, menu, fieldBounds);
            scope.menuHidden = !menuShown;
        },

        showActions: function(scope, obj, options) {
            options = options || {};

            var rootEl = options.rootEl,
                signProps = obj.asc_getSignatureProps(scope.api),
                storedSignature = this.getSavedSignature(),
                currentSignature = this.getCurrentSignature(signProps),
                menu = scope.signatureControlMenu,
                me = this,
                uncheck = function() {
                    scope.api.asc_UncheckContentControlButtons();
                },
                closeMenu = function(currentMenu) {
                    scope.menuHidden = false;
                    me.hideMenu(rootEl, currentMenu);
                    uncheck();
                };

            if (!storedSignature.length) {
                options.openDialog && options.openDialog.call(scope, signProps);
                return;
            }

            scope.currentSignatureProps = signProps;
            scope._fromShowContentControls = true;
            Common.UI.Menu.Manager.hideAll();

            if (!menu) {
                menu = this.createMenu(rootEl, {
                    storedSignature: storedSignature,
                    currentSignature: currentSignature,
                    onApply: function(data, menu) {
                        options.applySignature && options.applySignature.call(scope, scope.currentSignatureProps, data);
                        closeMenu(menu);
                    },
                    onDelete: function(data, menu) {
                        me.removeSavedSignature(data);
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
                this.syncMenu(menu, storedSignature, currentSignature);
            }

            var menuContainer = this.getMenuContainer(rootEl, menu),
                fieldBounds = this.getFieldRect(scope, signProps),
                menuShown;
            menuContainer.attr('data-value', 'prevent-canvas-click');
            scope._preventClick = true;
            menuShown = fieldBounds ? this.showMenu(rootEl, menuContainer, menu, fieldBounds) : false;
            scope.menuHidden = !menuShown;
            scope._fromShowContentControls = false;
        },

        txtDeleteSavedSignature: 'Delete saved signature',
        txtCreateNewSignature: 'Create a new signature'
    }, Common.Views.PdfSavedSignatureMenu || {});
});