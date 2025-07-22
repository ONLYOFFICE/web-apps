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
 *  ShortcutsDialog.js
 *
 *  Created on 23/06/25
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    Common.Views.ShortcutsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 550,
            separator: false
        },

        initialize : function(options) {
            _.extend(this.options, {
                id: 'shortcuts-gialog',
                title: this.txtTitle,
                contentStyle: 'padding: 16px 16px 0;',
                contentTemplate: _.template([
                    '<div id="header-row">', 
                        '<input id="search-input" type="text" spellcheck="false" class="form-control" placeholder="<%= scope.txtSearch %>...">',
                        '<label id="restore-all-btn" class="link"><%= scope.txtRestoreAll %></label>',
                    '</div>',
                    '<div id="actions-list"></div>'
                ].join(''))({scope: this}),
                buttons: []
            }, options);

            this.handler    = options.handler;
            this._state     = {
                actionsData: []
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            this.actionsList = new Common.UI.ListView({
                el: $('#actions-list', this.$window),
                emptyText: this.txtEmpty,
                store: new Common.UI.DataViewStore(),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item">',
                        '<div class="action-name"><%= action.name %></div>',
                        '<div class="action-keys">',
                            '<% _.each(shortcuts, function(shortcut, shortcutIndex) { %>',
                                '<% if (shortcutIndex != 0) { %>',
                                    '<div class="action-keys-comma">,</div>',
                                '<% } %>',
                                '<div class="action-keys-item">',
                                    '<% _.each(shortcut.keys, function(key, keyIndex) { %>',
                                        '<% if (keyIndex != 0) { %>',
                                            '<div class="action-keys-item-plus">+</div>',
                                        '<% } %>',
                                        '<div class="action-keys-item-key"><%= key %></div>',
                                    '<% }); %>',
                                '</div>',
                            '<% }); %>',
                        '</div>',
                        '<% if (!action.isLocked) { %>',
                            '<button type="button" class="action-edit btn-toolbar"><i class="icon toolbar__icon btn-edit">&nbsp;</i></button>',
                        '<% } %>',
                    '</div>'
                ].join(''))
            });
            this.actionsList.on('item:click', _.bind(this.onClickActionItem, this));
            this.actionsList.on('item:dblclick', _.bind(this.onEditActionItem, this));

            this.searchInput = this.$window.find('#search-input');
            this.searchInput.on('input', _.bind(this.onInputSearch, this));

            this._setDefaults();
        },

        getFocusedComponents: function() {
            return [].concat(this.getFooterButtons());
        },

        _keyCodeToKeyName: function(code) {
            const specialKeys = {
                8: 'Backspace',
                9: 'Tab',
                13: 'Enter',
                16: 'Shift',
                17: 'Ctrl',
                18: 'Alt',
                19: 'Pause',
                20: 'CapsLock',
                27: 'Escape',
                32: 'Space',
                33: 'PageUp',
                34: 'PageDown',
                35: 'End',
                36: 'Home',
                37: 'ArrowLeft',
                38: 'ArrowUp',
                39: 'ArrowRight',
                40: 'ArrowDown',
                45: 'Insert',
                46: 'Delete',
                91: 'Meta',
                93: 'ContextMenu',
                112: 'F1',
                113: 'F2',
                114: 'F3',
                115: 'F4',
                116: 'F5',
                117: 'F6',
                118: 'F7',
                119: 'F8',
                120: 'F9',
                121: 'F10',
                122: 'F11',
                123: 'F12',
            };

            if (specialKeys[code]) {
                return specialKeys[code];
            }
            return String.fromCharCode(code);
        },

        _setDefaults: function() {
            const me = this;
            let actionsData = {};
            for (var actionName in Asc.c_oAscDocumentShortcutType) {
                const type = Asc.c_oAscDocumentShortcutType[actionName];
                actionsData[type] = {
                    action: {
                        name: actionName,
                        type: type,
                        isLocked: !Asc.c_oAscUnlockedShortcutActionTypes[type]
                    },
                    shortcuts: []
                }
            }

            _.values(Asc.c_oAscDefaultShortcuts).forEach(function(shortcuts) {
                const actionType = shortcuts[0].asc_GetType();
                
                if(actionsData[actionType]) {
                    actionsData[actionType].shortcuts = shortcuts.map(function(shortcut) {
                        const keys = [];
                        shortcut.asc_IsCtrl() && keys.push('Ctrl');
                        shortcut.asc_IsShift() && keys.push('Shift');
                        shortcut.asc_IsAlt() && keys.push('Alt');
                        shortcut.asc_IsCommand() && keys.push('⌘');
                        keys.push(me._keyCodeToKeyName(shortcut.asc_GetKeyCode()));
                        return {
                            shortcut: shortcut,
                            keys: keys 
                        }
                    });
                }
            });
            
            actionsData = _.values(actionsData);
            this._state.actionsData = actionsData;
            this.actionsList.store.reset(actionsData)
        },

        onClickActionItem: function(list, item, record, event) {
            if($(event.target).hasClass('action-edit') || $(event.target).parent().hasClass('action-edit')) {
                this.onEditActionItem(list, item, record);
            }
        },

        onEditActionItem: function(list, item, record) {
            if(record.get('action').isLocked) return;
            
            const me = this;
            const win = new Common.Views.ShortcutEditDialog({
                action: record.get('action'),
                shortcuts: record.get('shortcuts').map(function(item) {
                    const copyShortcutInstance = new Asc.CAscShortcut(
                        item.shortcut.asc_GetType(),
                        item.shortcut.asc_GetKeyCode(),
                        item.shortcut.asc_IsCtrl(),
                        item.shortcut.asc_IsShift(),
                        item.shortcut.asc_IsAlt(),
                        item.shortcut.asc_IsCommand(),
                        item.shortcut.asc_IsLocked(),
                        item.shortcut.asc_IsHidden()
                    );
                    return {
                        keys: item.keys,
                        shortcut: copyShortcutInstance
                    }
                }),
                keyCodeToKeyName: this._keyCodeToKeyName,
                findAssignedShortcut: function(shortcut, extraAction) {
                    const shortcutIndex = shortcut.asc_GetShortcutIndex();

                    const foundAction = _.find(me._state.actionsData, function(item) {
                        if (record.get('action').type === item.action.type) {
                            item = extraAction;
                        }

                        return item && _.find(item.shortcuts, function(s) {
                            return s.shortcut.asc_GetShortcutIndex() === shortcutIndex;
                        });
                    });

                    return foundAction || null;
                }  
            });
            win.show();
        },

        onInputSearch: function(event) {
            const value = $(event.target).val().toLowerCase().trim();
            let filteredData;
            if(value) {
                filteredData = this._state.actionsData.filter(function(item) {
                    return item.action.name.toLowerCase().includes(value);
                });
            } else {
                filteredData = this._state.actionsData;
            }
            this.actionsList.store.reset(filteredData);
        },
        
        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                this.handler && this.handler.call(this, state,  (state == 'ok') ? null : undefined);
            }

            this.close();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        txtTitle: 'Keyboard Shortcuts',
        txtEmpty: 'No matches found. Adjust your search.',
        txtSearch: 'Search',
        txtRestoreAll: 'Restore All to Defaults',

    },  Common.Views.ShortcutsDialog || {}))
});