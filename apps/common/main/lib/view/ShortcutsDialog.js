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
                        '<label id="reset-all-btn" class="link"><%= scope.txtRestoreAll %></label>',
                    '</div>',
                    '<div id="actions-list"></div>',
                    '<div id="action-description">',
                        '<b>Description: </b>',
                        '<span id="action-description-text"></span>',
                    '</div>'
                ].join(''))({scope: this}),
                buttons: []
            }, options);

            this.handler    = options.handler;
            this.api = options.api;

            this._state     = {
                actionsMap: [],
                searchValue: ''
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
                            '<% _.each(_.filter(shortcuts, function(shortcut) { return !shortcut.ascShortcut.asc_IsHidden() }), function(shortcut, shortcutIndex) { %>',
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
                            '<button type="button" class="action-edit btn-toolbar">',
                                '<i class="icon toolbar__icon btn-edit">&nbsp;</i>',
                            '</button>',
                        '<% } %>',
                    '</div>'
                ].join(''))
            });
            this.actionsList.on('item:select', _.bind(this.onSelectActionItem, this));
            this.actionsList.on('item:click', _.bind(this.onClickActionItem, this));
            this.actionsList.on('item:dblclick', _.bind(this.onEditActionItem, this));

            this.searchInput = this.$window.find('#search-input');
            this.searchInput.on('input', _.bind(this.onInputSearch, this));

            this.resetAllBtn = this.$window.find('#reset-all-btn');
            this.resetAllBtn.on('click', _.bind(this.onResetAll, this));


            $(window).on('storage', function (e) {
                if(e.key == 'shortcuts') {
                    this._setDefaults();
                    this.shortcutEditDialog && this.shortcutEditDialog.renderShortcutsWarning();
                }
            }.bind(this))
            this._setDefaults();
        },

        getFocusedComponents: function() {
            return [].concat(this.getFooterButtons());
        },

        _keyCodeToKeyName: function(code) {
             const specialKeys = {
                8: 'Backspace',
                9: 'Tab',
                12: 'Clear',
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
                107: 'Numpad+',
                109: 'Numpad-',
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
                173: 'ff-',
                61: 'ff=',
                186: ';',
                187: '=',
                188: ',',
                189: '-',
                190: '.',
                191: '/',
                192: '`',
                219: '[',
                220: '\\',
                221: ']',
                222: '\'',
            };

            if (specialKeys[code]) {
                return specialKeys[code];
            }
            return String.fromCharCode(code);
        },

        _getAscShortcutKeys(ascShortcut) {
            const keys = [];
            ascShortcut.asc_IsCtrl() && keys.push('Ctrl');
            ascShortcut.asc_IsShift() && keys.push('Shift');
            ascShortcut.asc_IsAlt() && keys.push('Alt');
            ascShortcut.asc_IsCommand() && keys.push('⌘');
            keys.push(this._keyCodeToKeyName(ascShortcut.asc_GetKeyCode()));
            return keys;
        },

        /**
         * Retrieves user-modified shortcuts from localStorage.
         * @returns {Object<number, CAscShortcut[]>}
         *  An object where keys are action types and values are arrays of ascShortcut instances.
        */
        _getModifiedShortcuts: function() {
            const storage = JSON.parse(Common.localStorage.getItem("shortcuts") || "{}");
            for (const actionType in storage) {
                storage[actionType] = storage[actionType].map(function(ascShortcutJson) {
                    const ascShortcut = new Asc.CAscShortcut();
                    ascShortcut.asc_FromJson(ascShortcutJson);
                    return ascShortcut;
                });
            }
            return storage;
        },

        /**
         * Saves modified shortcuts to localStorage by applying added and removed changes.
         * @param {Object<number, CAscShortcut[]>} savedActionsMap
         *   An object containing new or updated shortcuts, grouped by action type.
         * @param {Object<number, CAscShortcut[]>} removedActionsMap
         *   An object containing shortcuts to be removed, grouped by action type.
         * @example
         * this._saveModifiedShortcuts(
         *   { "7": [ascShortcut1, ascShortcut2] },
         *   { "52": [ascShortcut3] }
         * );
         * // Result:
         * // - For action type "7", shortcuts are replaced with [ascShortcut1, ascShortcut2]
         * // - For action type "52", ascShortcut3 is removed
         * // - The final shortcuts are saved to localStorage
        */
        _saveModifiedShortcuts: function(savedActionsMap, removedActionsMap) {
            const customShortcuts = _.extend({}, this._getModifiedShortcuts(), savedActionsMap || {});

            for (const actionType in removedActionsMap || {}) {
                if (!customShortcuts[actionType]) continue;

                const removed = removedActionsMap[actionType];
                customShortcuts[actionType] = _.filter(customShortcuts[actionType], function(ascShortcut) {
                    return !_.some(removed, function(r) {
                        return ascShortcut.asc_GetShortcutIndex() === r.asc_GetShortcutIndex();
                    });
                });
            }

            for (const actionType in customShortcuts) {
                customShortcuts[actionType] = customShortcuts[actionType].map(function(ascShortcut) {
                    return ascShortcut.asc_ToJson();
                });
            }
            Common.localStorage.setItem("shortcuts", JSON.stringify(customShortcuts));
        },

        _removeAllModifiedShortcuts: function() {
            Common.localStorage.setItem("shortcuts", '');
        },

        _getDefaultShortcutType: function() {
            if(window.DE) {
                return Asc.c_oAscDocumentShortcutType;
            } else if(window.PE) {
                return Asc.c_oAscPresentationShortcutType;
            }
        },

        _setDefaults: function() {
            const me = this;
            let actionsMap = {};
            const defaultShortcutType = this._getDefaultShortcutType();
            for (let actionName in defaultShortcutType) {
                const type = defaultShortcutType[actionName];
                actionsMap[type] = {
                    action: {
                        name: this['txtLabel' + actionName],
                        description: this['txtDescription' + actionName],
                        type: type,
                        isLocked: !Asc.c_oAscUnlockedShortcutActionTypes[type]
                    },
                    shortcuts: []
                }
            }

            _.pairs(Asc.c_oAscDefaultShortcuts).forEach(function(item) {
                const actionType = item[0];
                const shortcuts = item[1];
                const actionItem = actionsMap[actionType];

                if(actionItem) {
                    actionItem.shortcuts = shortcuts.map(function(ascShortcut) {
                        return {
                            keys: me._getAscShortcutKeys(ascShortcut),
                            isCustom: false,
                            ascShortcut: ascShortcut,
                        }
                    });
                }
            });

            let removableIndexes = {};
            _.pairs(this._getModifiedShortcuts()).forEach(function(item) {
                const actionType = item[0];
                const shortcuts = item[1];
                const actionItem = actionsMap[actionType];
                
                if(actionItem) {
                    shortcuts.forEach(function(ascShortcut) {
                        const ascShortcutIndex = ascShortcut.asc_GetShortcutIndex();
                        const defaultShortcutIndex = _.findIndex(actionItem.shortcuts, function(shortcut) { 
                            return shortcut.ascShortcut.asc_GetShortcutIndex() == ascShortcutIndex;
                        });

                        if(defaultShortcutIndex != -1) {
                            actionItem.shortcuts[defaultShortcutIndex].ascShortcut = ascShortcut;
                        } else {
                            removableIndexes[ascShortcutIndex] = actionType;
                            actionItem.shortcuts.push({
                                keys: me._getAscShortcutKeys(ascShortcut),
                                isCustom: true,
                                ascShortcut: ascShortcut,
                            });
                        }    
                    });
                }
            })

            for (const actionType in actionsMap) {
                const item = actionsMap[actionType];
                const shortcuts = actionsMap[actionType].shortcuts;
                if(shortcuts.length == 0 && item.action.isLocked) {
                    // Delete actions if it has no shortcuts and the action is locked
                    delete actionsMap[actionType];
                } else if(Object.keys(removableIndexes).length > 0) {
                    // Remove shortcuts from other actions if they conflict with updated shortcuts
                    const foundIndex = _.findIndex(shortcuts, function(shortcut) {
                        const ascShortcutIndex = shortcut.ascShortcut.asc_GetShortcutIndex();
                        if(removableIndexes[ascShortcutIndex] && removableIndexes[ascShortcutIndex] != actionType) {
                            delete removableIndexes[ascShortcutIndex];
                            return true;
                        }
                        return false;
                    });
                    if(foundIndex != -1) {
                        const copyAscShortcut = new Asc.CAscShortcut();
                        copyAscShortcut.asc_FromJson(shortcuts[foundIndex].ascShortcut.asc_ToJson());
                        copyAscShortcut.asc_SetIsHidden(true);
                        shortcuts[foundIndex].ascShortcut = copyAscShortcut;
                    }
                }
            }

            this._state.actionsMap = actionsMap;
            this._updateActionsList();
        },

        _updateActionsList: function() {
            const selectedActionIndex = this.actionsList.store.findIndex(function(item) { 
                return item.get('selected');
            });
            const scrollPos = this.actionsList.scroller.getScrollTop();

            if(this._state.searchValue) {
                this._filterActionsList();
            } else {
                this.actionsList.store.reset(_.values(this._state.actionsMap));
            }

            this.actionsList.scroller.scrollTop(scrollPos);
            if(selectedActionIndex != -1) {
                this.actionsList.selectByIndex(selectedActionIndex);
            }
        },

        _filterActionsList: function() {
            let filteredData;
            const me = this;
            const actionsData = _.values(this._state.actionsMap);
            if(me._state.searchValue) {
                filteredData = actionsData.filter(function(item) {
                    return item.action.name.toLowerCase().includes(me._state.searchValue);
                });
            } else {
                filteredData = actionsData;
            }
            this.actionsList.store.reset(filteredData);
        },

        onSelectActionItem: function(list, item, record, event) {
            const text = record ? record.get('action').description : '';
            this.$window.find('#action-description-text').text(text);
        },

        onClickActionItem: function(list, item, record, event) {
            if($(event.target).hasClass('action-edit') || $(event.target).parent().hasClass('action-edit')) {
                this.onEditActionItem(list, item, record);
            }
        },

        onEditActionItem: function(list, item, record) {
            if(record.get('action').isLocked) return;
            
            const me = this;
            const actionType = record.get('action').type;

            const unhiddenShortcuts = _.filter(record.get('shortcuts'), function(shortcut) {
                return !shortcut.ascShortcut.asc_IsHidden();
            });
            this.shortcutEditDialog = new Common.Views.ShortcutEditDialog({
                action: record.get('action'),
                shortcuts: unhiddenShortcuts.map(function(shortcut) {
                    const copyAscShortcut = new Asc.CAscShortcut();
                    copyAscShortcut.asc_FromJson(shortcut.ascShortcut.asc_ToJson());
                    return {
                        keys: shortcut.keys,
                        ascShortcut: copyAscShortcut
                    };
                }),
                keyCodeToKeyName: this._keyCodeToKeyName,
                handler: function(result, updatedShortcuts) {
                    if (result != 'ok') return;

                    let resultShortcuts = [];
                    const originalShortcuts = record.get('shortcuts');

                    // Update hidden status and create copies for those not in updatedShortcuts
                    originalShortcuts.forEach(function(item) {
                        const existsInUpdated = _.some(updatedShortcuts, function(el) { 
                            return el.ascShortcut.asc_GetShortcutIndex() === item.ascShortcut.asc_GetShortcutIndex();
                        });
                        if(!existsInUpdated && !item.ascShortcut.asc_IsHidden()) {
                            const copyAscShortcut = new Asc.CAscShortcut();
                            copyAscShortcut.asc_FromJson(item.ascShortcut.asc_ToJson());
                            item.ascShortcut = copyAscShortcut;
                        }
                        item.ascShortcut.asc_SetIsHidden(!existsInUpdated);
                        resultShortcuts.push(item);
                    });

                    // Add new custom shortcuts that are not in originalShortcuts
                    updatedShortcuts.forEach(function(item) {
                        const existsInOriginal = _.some(originalShortcuts, function(el) { 
                            return el.ascShortcut.asc_GetShortcutIndex() === item.ascShortcut.asc_GetShortcutIndex();
                        });
                        if(!existsInOriginal) {
                            item.isCustom = true;
                            resultShortcuts.push(item);
                        }  
                    });

                    const action = me._state.actionsMap[actionType];
                    action && (action.shortcuts = resultShortcuts);

                    // Remove shortcuts from other actions if they conflict with updated shortcuts
                    const removableIndexes = updatedShortcuts.map(function(item) { 
                        return item.ascShortcut.asc_GetShortcutIndex()
                    });
                    const removableFromStorage = {};
                    for (const type in me._state.actionsMap) {
                        if(removableIndexes.length == 0) break;
                        if(type == actionType) continue;

                        const shortcuts = me._state.actionsMap[type].shortcuts;
                        const foundIndex = _.findIndex(shortcuts, function(shortcut) {
                            const foundIndex = _.indexOf(removableIndexes, shortcut.ascShortcut.asc_GetShortcutIndex());
                            (foundIndex != -1) && removableIndexes.splice(foundIndex, 1);
                            return foundIndex != -1;
                        });
                        if(foundIndex != -1) {
                            const copyAscShortcut = new Asc.CAscShortcut();
                            copyAscShortcut.asc_FromJson(shortcuts[foundIndex].ascShortcut.asc_ToJson());
                            copyAscShortcut.asc_SetIsHidden(true);
                            shortcuts[foundIndex].ascShortcut = copyAscShortcut;

                            !removableFromStorage[type] && (removableFromStorage[type] = []);
                            removableFromStorage[type].push(shortcuts[foundIndex].ascShortcut);
                        }
                    }
                    me._updateActionsList();

                    me.api.asc_applyAscShortcuts(resultShortcuts.map(function(shortcut) { 
                        return shortcut.ascShortcut;
                    }));

                    //Filter for save in local storage
                    const savedInStorage = {
                        [actionType] : _.filter(resultShortcuts, function(item) { 
                            return item.isCustom !== item.ascShortcut.asc_IsHidden();
                        }).map(function(shortcut) {
                            return shortcut.ascShortcut;
                        })
                    };
                    me._saveModifiedShortcuts(savedInStorage, removableFromStorage);
                },
                // Is this shortcut default for this action?
                isDefaultShortcut: function(ascShortcut) {
                    const shortcutIndex = ascShortcut.asc_GetShortcutIndex();
                    return _.some(Asc.c_oAscDefaultShortcuts[ascShortcut.asc_GetType()], function(someAscShortcut) {
                        return shortcutIndex == someAscShortcut.asc_GetShortcutIndex();
                    });
                },

                /**
                 * Finds all actions that already have the given shortcut assigned.
                 *
                 * If `extraAction` is provided and its `extraAction.actionType` matches the current item,
                 * the method will check `extraAction.shortcuts` instead of the original shortcuts.
                 *
                 * @param {CAscShortcut} ascShortcut The shortcut to search for.
                 * 
                 * @param {Object} [extraAction] Optional object that can replace the shortcuts of a matching action.
                 * @param {number} extraAction.actionType The type of the action to match.
                 * @param {CAscShortcut[]} extraAction.shortcuts Custom list of shortcuts to check for this action.
                 * @returns {Object[]} Array of action objects that already use the given shortcut.
                 */
                findAssignedActions: function(ascShortcut, extraAction) {
                    const shortcutIndex = ascShortcut.asc_GetShortcutIndex();
                    const foundItems = [];
                    const values = _.values(me._state.actionsMap);

                    for (let i = 0; i < values.length; i++) {
                        let item = values[i];

                        if (extraAction && extraAction.actionType === item.action.type ) {
                            item.shortcuts = extraAction.shortcuts;
                        }

                        const existsVisible = _.some(item.shortcuts, function(shortcut) {
                            return shortcut.ascShortcut.asc_GetShortcutIndex() == shortcutIndex &&
                                !shortcut.ascShortcut.asc_IsHidden();
                        });

                        if (existsVisible) {
                            foundItems.push(item);
                        }
                    }

                    return _.map(foundItems, function(item) { return item.action; });
                },
                
                /**
                 * Returns the default shortcuts for the current action type.
                 *
                 * @returns {Array<Object>} Array of shortcut objects.
                 * @returns {string[]}   return[].keys - Array of key strings representing the shortcut (["Ctrl", "S"]).
                 * @returns {ascShortcut} return[].ascShortcut - Instance of CAscShortcut.
                */
                getDefaultShortcuts: function() {
                    const ascShortcuts = Asc.c_oAscDefaultShortcuts[actionType];
                    return ascShortcuts.map(function(ascShortcut) {
                        const copyAscShortcut = new Asc.CAscShortcut();
                        copyAscShortcut.asc_FromJson(ascShortcut.asc_ToJson());
                        copyAscShortcut.asc_SetIsHidden(false);
                        return {
                            keys: me._getAscShortcutKeys(copyAscShortcut),
                            ascShortcut: copyAscShortcut
                        }
                    });
                } 
            });
            this.shortcutEditDialog.show();
            this.shortcutEditDialog.on('close', function() {
                me.shortcutEditDialog = null;
            });
        },

        onInputSearch: function(event) {
            this._state.searchValue = $(event.target).val().toLowerCase().trim();
            this._filterActionsList();
            this.onSelectActionItem(null, null, null);
        },

        onResetAll: function() {
            const me = this;

            Common.UI.warning({
                title: this.txtRestoreToDefault,
                msg: this.txtRestoreDescription + '<br/>' + this.txtRestoreContinue,
                buttons: ['ok', 'cancel'],
                width: 400,
                callback: function(btn) {
                    if(btn == 'ok') {
                        me.api.asc_resetAllShortcutTypes();
                        for (const actionType in Asc.c_oAscDefaultShortcuts) {
                            const actionItem = me._state.actionsMap[actionType];
                            actionItem.shortcuts = Asc.c_oAscDefaultShortcuts[actionType].map(function(ascShortcut) {
                                return {
                                    keys: me._getAscShortcutKeys(ascShortcut),
                                    isCustom: false,
                                    ascShortcut: ascShortcut,
                                }
                            });
                        }
                        me._updateActionsList();
                        me._removeAllModifiedShortcuts();
                    }
                }
            });
        },
        
        onDlgBtnClick: function(event) {
            let state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
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
        txtRestoreToDefault: 'Restore to default',
        txtRestoreDescription: 'All shortcuts settings will be restored to deafult.',
        txtRestoreContinue: 'Do you want to continue?',


        txtLabelOpenFilePanel: 'OpenFilePanel',
        txtDescriptionOpenFilePanel: 'Description OpenFilePanel',
        txtLabelOpenFindDialog: 'OpenFindDialog',
        txtDescriptionOpenFindDialog: 'Description OpenFindDialog',
        txtLabelOpenFindAndReplaceMenu: 'OpenFindAndReplaceMenu',
        txtDescriptionOpenFindAndReplaceMenu: 'Description OpenFindAndReplaceMenu',
        txtLabelOpenCommentsPanel: 'OpenCommentsPanel',
        txtDescriptionOpenCommentsPanel: 'Description OpenCommentsPanel',
        txtLabelOpenCommentField: 'OpenCommentField',
        txtDescriptionOpenCommentField: 'Description OpenCommentField',
        txtLabelOpenChatPanel: 'OpenChatPanel',
        txtDescriptionOpenChatPanel: 'Description OpenChatPanel',
        txtLabelSave: 'Save',
        txtDescriptionSave: 'Description Save',
        txtLabelPrintPreviewAndPrint: 'PrintPreviewAndPrint',
        txtDescriptionPrintPreviewAndPrint: 'Description PrintPreviewAndPrint',
        txtLabelSaveAs: 'SaveAs',
        txtDescriptionSaveAs: 'Description SaveAs',
        txtLabelOpenHelpMenu: 'OpenHelpMenu',
        txtDescriptionOpenHelpMenu: 'Description OpenHelpMenu',
        txtLabelOpenExistingFile: 'OpenExistingFile',
        txtDescriptionOpenExistingFile: 'Description OpenExistingFile',
        txtLabelNextFileTab: 'NextFileTab',
        txtDescriptionNextFileTab: 'Description NextFileTab',
        txtLabelPreviousFileTab: 'PreviousFileTab',
        txtDescriptionPreviousFileTab: 'Description PreviousFileTab',
        txtLabelCloseFile: 'CloseFile',
        txtDescriptionCloseFile: 'Description CloseFile',
        txtLabelOpenContextMenu: 'OpenContextMenu',
        txtDescriptionOpenContextMenu: 'Description OpenContextMenu',
        txtLabelCloseMenu: 'CloseMenu',
        txtDescriptionCloseMenu: 'Description CloseMenu',
        txtLabelZoom100: 'Zoom100',
        txtDescriptionZoom100: 'Description Zoom100',
        txtLabelUpdateFields: 'UpdateFields',
        txtDescriptionUpdateFields: 'Description UpdateFields',
        txtLabelMoveToStartLine: 'MoveToStartLine',
        txtDescriptionMoveToStartLine: 'Description MoveToStartLine',
        txtLabelMoveToStartDocument: 'MoveToStartDocument',
        txtDescriptionMoveToStartDocument: 'Description MoveToStartDocument',
        txtLabelMoveToEndLine: 'MoveToEndLine',
        txtDescriptionMoveToEndLine: 'Description MoveToEndLine',
        txtLabelMoveToEndDocument: 'MoveToEndDocument',
        txtDescriptionMoveToEndDocument: 'Description MoveToEndDocument',
        txtLabelMoveToStartPreviousPage: 'MoveToStartPreviousPage',
        txtDescriptionMoveToStartPreviousPage: 'Description MoveToStartPreviousPage',
        txtLabelMoveToStartNextPage: 'MoveToStartNextPage',
        txtDescriptionMoveToStartNextPage: 'Description MoveToStartNextPage',
        txtLabelMoveToNextPage: 'MoveToNextPage',
        txtDescriptionMoveToNextPage: 'Description MoveToNextPage',
        txtLabelMoveToPreviousPage: 'MoveToPreviousPage',
        txtDescriptionMoveToPreviousPage: 'Description MoveToPreviousPage',
        txtLabelScrollDown: 'ScrollDown',
        txtDescriptionScrollDown: 'Description ScrollDown',
        txtLabelScrollUp: 'ScrollUp',
        txtDescriptionScrollUp: 'Description ScrollUp',
        txtLabelZoomIn: 'ZoomIn',
        txtDescriptionZoomIn: 'Description ZoomIn',
        txtLabelZoomOut: 'ZoomOut',
        txtDescriptionZoomOut: 'Description ZoomOut',
        txtLabelMoveToRightChar: 'MoveToRightChar',
        txtDescriptionMoveToRightChar: 'Description MoveToRightChar',
        txtLabelMoveToLeftChar: 'MoveToLeftChar',
        txtDescriptionMoveToLeftChar: 'Description MoveToLeftChar',
        txtLabelMoveToUpLine: 'MoveToUpLine',
        txtDescriptionMoveToUpLine: 'Description MoveToUpLine',
        txtLabelMoveToDownLine: 'MoveToDownLine',
        txtDescriptionMoveToDownLine: 'Description MoveToDownLine',
        txtLabelMoveToStartWord: 'MoveToStartWord',
        txtDescriptionMoveToStartWord: 'Description MoveToStartWord',
        txtLabelMoveToEndWord: 'MoveToEndWord',
        txtDescriptionMoveToEndWord: 'Description MoveToEndWord',
        txtLabelNextModalControl: 'NextModalControl',
        txtDescriptionNextModalControl: 'Description NextModalControl',
        txtLabelPreviousModalControl: 'PreviousModalControl',
        txtDescriptionPreviousModalControl: 'Description PreviousModalControl',
        txtLabelMoveToLowerHeaderFooter: 'MoveToLowerHeaderFooter',
        txtDescriptionMoveToLowerHeaderFooter: 'Description MoveToLowerHeaderFooter',
        txtLabelMoveToUpperHeaderFooter: 'MoveToUpperHeaderFooter',
        txtDescriptionMoveToUpperHeaderFooter: 'Description MoveToUpperHeaderFooter',
        txtLabelMoveToLowerHeader: 'MoveToLowerHeader',
        txtDescriptionMoveToLowerHeader: 'Description MoveToLowerHeader',
        txtLabelMoveToUpperHeader: 'MoveToUpperHeader',
        txtDescriptionMoveToUpperHeader: 'Description MoveToUpperHeader',
        txtLabelEndParagraph: 'EndParagraph',
        txtDescriptionEndParagraph: 'Description EndParagraph',
        txtLabelInsertLineBreak: 'InsertLineBreak',
        txtDescriptionInsertLineBreak: 'Description InsertLineBreak',
        txtLabelInsertColumnBreak: 'InsertColumnBreak',
        txtDescriptionInsertColumnBreak: 'Description InsertColumnBreak',
        txtLabelEquationAddPlaceholder: 'EquationAddPlaceholder',
        txtDescriptionEquationAddPlaceholder: 'Description EquationAddPlaceholder',
        txtLabelEquationChangeAlignmentLeft: 'EquationChangeAlignmentLeft',
        txtDescriptionEquationChangeAlignmentLeft: 'Description EquationChangeAlignmentLeft',
        txtLabelEquationChangeAlignmentRight: 'EquationChangeAlignmentRight',
        txtDescriptionEquationChangeAlignmentRight: 'Description EquationChangeAlignmentRight',
        txtLabelDeleteLeftChar: 'DeleteLeftChar',
        txtDescriptionDeleteLeftChar: 'Description DeleteLeftChar',
        txtLabelDeleteRightChar: 'DeleteRightChar',
        txtDescriptionDeleteRightChar: 'Description DeleteRightChar',
        txtLabelDeleteLeftWord: 'DeleteLeftWord',
        txtDescriptionDeleteLeftWord: 'Description DeleteLeftWord',
        txtLabelDeleteRightWord: 'DeleteRightWord',
        txtDescriptionDeleteRightWord: 'Description DeleteRightWord',
        txtLabelNonBreakingSpace: 'NonBreakingSpace',
        txtDescriptionNonBreakingSpace: 'Description NonBreakingSpace',
        txtLabelNonBreakingHyphen: 'NonBreakingHyphen',
        txtDescriptionNonBreakingHyphen: 'Description NonBreakingHyphen',
        txtLabelEditUndo: 'EditUndo',
        txtDescriptionEditUndo: 'Description EditUndo',
        txtLabelEditRedo: 'EditRedo',
        txtDescriptionEditRedo: 'Description EditRedo',
        txtLabelCut: 'Cut',
        txtDescriptionCut: 'Description Cut',
        txtLabelCopy: 'Copy',
        txtDescriptionCopy: 'Description Copy',
        txtLabelPaste: 'Paste',
        txtDescriptionPaste: 'Description Paste',
        txtLabelPasteTextWithoutFormat: 'PasteTextWithoutFormat',
        txtDescriptionPasteTextWithoutFormat: 'Description PasteTextWithoutFormat',
        txtLabelCopyFormat: 'CopyFormat',
        txtDescriptionCopyFormat: 'Description CopyFormat',
        txtLabelPasteFormat: 'PasteFormat',
        txtDescriptionPasteFormat: 'Description PasteFormat',
        txtLabelSpecialOptionsKeepSourceFormat: 'SpecialOptionsKeepSourceFormat',
        txtDescriptionSpecialOptionsKeepSourceFormat: 'Description SpecialOptionsKeepSourceFormat',
        txtLabelSpecialOptionsKeepTextOnly: 'SpecialOptionsKeepTextOnly',
        txtDescriptionSpecialOptionsKeepTextOnly: 'Description SpecialOptionsKeepTextOnly',
        txtLabelSpecialOptionsOverwriteCells: 'SpecialOptionsOverwriteCells',
        txtDescriptionSpecialOptionsOverwriteCells: 'Description SpecialOptionsOverwriteCells',
        txtLabelSpecialOptionsNestTable: 'SpecialOptionsNestTable',
        txtDescriptionSpecialOptionsNestTable: 'Description SpecialOptionsNestTable',
        txtLabelInsertHyperlink: 'InsertHyperlink',
        txtDescriptionInsertHyperlink: 'Description InsertHyperlink',
        txtLabelVisitHyperlink: 'VisitHyperlink',
        txtDescriptionVisitHyperlink: 'Description VisitHyperlink',
        txtLabelEditSelectAll: 'EditSelectAll',
        txtDescriptionEditSelectAll: 'Description EditSelectAll',
        txtLabelSelectToStartLine: 'SelectToStartLine',
        txtDescriptionSelectToStartLine: 'Description SelectToStartLine',
        txtLabelSelectToEndLine: 'SelectToEndLine',
        txtDescriptionSelectToEndLine: 'Description SelectToEndLine',
        txtLabelSelectToStartDocument: 'SelectToStartDocument',
        txtDescriptionSelectToStartDocument: 'Description SelectToStartDocument',
        txtLabelSelectToEndDocument: 'SelectToEndDocument',
        txtDescriptionSelectToEndDocument: 'Description SelectToEndDocument',
        txtLabelSelectRightChar: 'SelectRightChar',
        txtDescriptionSelectRightChar: 'Description SelectRightChar',
        txtLabelSelectLeftChar: 'SelectLeftChar',
        txtDescriptionSelectLeftChar: 'Description SelectLeftChar',
        txtLabelSelectRightWord: 'SelectRightWord',
        txtDescriptionSelectRightWord: 'Description SelectRightWord',
        txtLabelSelectLeftWord: 'SelectLeftWord',
        txtDescriptionSelectLeftWord: 'Description SelectLeftWord',
        txtLabelSelectLineUp: 'SelectLineUp',
        txtDescriptionSelectLineUp: 'Description SelectLineUp',
        txtLabelSelectLineDown: 'SelectLineDown',
        txtDescriptionSelectLineDown: 'Description SelectLineDown',
        txtLabelSelectPageUp: 'SelectPageUp',
        txtDescriptionSelectPageUp: 'Description SelectPageUp',
        txtLabelSelectPageDown: 'SelectPageDown',
        txtDescriptionSelectPageDown: 'Description SelectPageDown',
        txtLabelSelectToBeginPreviousPage: 'SelectToBeginPreviousPage',
        txtDescriptionSelectToBeginPreviousPage: 'Description SelectToBeginPreviousPage',
        txtLabelSelectToBeginNextPage: 'SelectToBeginNextPage',
        txtDescriptionSelectToBeginNextPage: 'Description SelectToBeginNextPage',
        txtLabelBold: 'Bold',
        txtDescriptionBold: 'Description Bold',
        txtLabelItalic: 'Italic',
        txtDescriptionItalic: 'Description Italic',
        txtLabelUnderline: 'Underline',
        txtDescriptionUnderline: 'Description Underline',
        txtLabelStrikeout: 'Strikeout',
        txtDescriptionStrikeout: 'Description Strikeout',
        txtLabelSubscript: 'Subscript',
        txtDescriptionSubscript: 'Description Subscript',
        txtLabelSuperscript: 'Superscript',
        txtDescriptionSuperscript: 'Description Superscript',
        txtLabelApplyHeading1: 'ApplyHeading1',
        txtDescriptionApplyHeading1: 'Description ApplyHeading1',
        txtLabelApplyHeading2: 'ApplyHeading2',
        txtDescriptionApplyHeading2: 'Description ApplyHeading2',
        txtLabelApplyHeading3: 'ApplyHeading3',
        txtDescriptionApplyHeading3: 'Description ApplyHeading3',
        txtLabelApplyListBullet: 'ApplyListBullet',
        txtDescriptionApplyListBullet: 'Description ApplyListBullet',
        txtLabelResetChar: 'ResetChar',
        txtDescriptionResetChar: 'Description ResetChar',
        txtLabelIncreaseFontSize: 'IncreaseFontSize',
        txtDescriptionIncreaseFontSize: 'Description IncreaseFontSize',
        txtLabelDecreaseFontSize: 'DecreaseFontSize',
        txtDescriptionDecreaseFontSize: 'Description DecreaseFontSize',
        txtLabelCenterPara: 'CenterPara',
        txtDescriptionCenterPara: 'Description CenterPara',
        txtLabelJustifyPara: 'JustifyPara',
        txtDescriptionJustifyPara: 'Description JustifyPara',
        txtLabelRightPara: 'RightPara',
        txtDescriptionRightPara: 'Description RightPara',
        txtLabelLeftPara: 'LeftPara',
        txtDescriptionLeftPara: 'Description LeftPara',
        txtLabelInsertPageBreak: 'InsertPageBreak',
        txtDescriptionInsertPageBreak: 'Description InsertPageBreak',
        txtLabelIndent: 'Indent',
        txtDescriptionIndent: 'Description Indent',
        txtLabelUnIndent: 'UnIndent',
        txtDescriptionUnIndent: 'Description UnIndent',
        txtLabelInsertPageNumber: 'InsertPageNumber',
        txtDescriptionInsertPageNumber: 'Description InsertPageNumber',
        txtLabelShowAll: 'ShowAll',
        txtDescriptionShowAll: 'Description ShowAll',
        txtLabelStartIndent: 'StartIndent',
        txtDescriptionStartIndent: 'Description StartIndent',
        txtLabelStartUnIndent: 'StartUnIndent',
        txtDescriptionStartUnIndent: 'Description StartUnIndent',
        txtLabelInsertTab: 'InsertTab',
        txtDescriptionInsertTab: 'Description InsertTab',
        txtLabelMixedIndent: 'MixedIndent',
        txtDescriptionMixedIndent: 'Description MixedIndent',
        txtLabelMixedUnIndent: 'MixedUnIndent',
        txtDescriptionMixedUnIndent: 'Description MixedUnIndent',
        txtLabelEditShape: 'EditShape',
        txtDescriptionEditShape: 'Description EditShape',
        txtLabelEditChart: 'EditChart',
        txtDescriptionEditChart: 'Description EditChart',
        txtLabelLittleMoveObjectLeft: 'LittleMoveObjectLeft',
        txtDescriptionLittleMoveObjectLeft: 'Description LittleMoveObjectLeft',
        txtLabelLittleMoveObjectRight: 'LittleMoveObjectRight',
        txtDescriptionLittleMoveObjectRight: 'Description LittleMoveObjectRight',
        txtLabelLittleMoveObjectUp: 'LittleMoveObjectUp',
        txtDescriptionLittleMoveObjectUp: 'Description LittleMoveObjectUp',
        txtLabelLittleMoveObjectDown: 'LittleMoveObjectDown',
        txtDescriptionLittleMoveObjectDown: 'Description LittleMoveObjectDown',
        txtLabelBigMoveObjectLeft: 'BigMoveObjectLeft',
        txtDescriptionBigMoveObjectLeft: 'Description BigMoveObjectLeft',
        txtLabelBigMoveObjectRight: 'BigMoveObjectRight',
        txtDescriptionBigMoveObjectRight: 'Description BigMoveObjectRight',
        txtLabelBigMoveObjectUp: 'BigMoveObjectUp',
        txtDescriptionBigMoveObjectUp: 'Description BigMoveObjectUp',
        txtLabelBigMoveObjectDown: 'BigMoveObjectDown',
        txtDescriptionBigMoveObjectDown: 'Description BigMoveObjectDown',
        txtLabelMoveFocusToNextObject: 'MoveFocusToNextObject',
        txtDescriptionMoveFocusToNextObject: 'Description MoveFocusToNextObject',
        txtLabelMoveFocusToPreviousObject: 'MoveFocusToPreviousObject',
        txtDescriptionMoveFocusToPreviousObject: 'Description MoveFocusToPreviousObject',
        txtLabelInsertEndnoteNow: 'InsertEndnoteNow',
        txtDescriptionInsertEndnoteNow: 'Description InsertEndnoteNow',
        txtLabelInsertFootnoteNow: 'InsertFootnoteNow',
        txtDescriptionInsertFootnoteNow: 'Description InsertFootnoteNow',
        txtLabelMoveToNextCell: 'MoveToNextCell',
        txtDescriptionMoveToNextCell: 'Description MoveToNextCell',
        txtLabelMoveToPreviousCell: 'MoveToPreviousCell',
        txtDescriptionMoveToPreviousCell: 'Description MoveToPreviousCell',
        txtLabelMoveToNextRow: 'MoveToNextRow',
        txtDescriptionMoveToNextRow: 'Description MoveToNextRow',
        txtLabelMoveToPreviousRow: 'MoveToPreviousRow',
        txtDescriptionMoveToPreviousRow: 'Description MoveToPreviousRow',
        txtLabelEndParagraphCell: 'EndParagraphCell',
        txtDescriptionEndParagraphCell: 'Description EndParagraphCell',
        txtLabelAddNewRow: 'AddNewRow',
        txtDescriptionAddNewRow: 'Description AddNewRow',
        txtLabelInsertTableBreak: 'InsertTableBreak',
        txtDescriptionInsertTableBreak: 'Description InsertTableBreak',
        txtLabelMoveToNextForm: 'MoveToNextForm',
        txtDescriptionMoveToNextForm: 'Description MoveToNextForm',
        txtLabelMoveToPreviousForm: 'MoveToPreviousForm',
        txtDescriptionMoveToPreviousForm: 'Description MoveToPreviousForm',
        txtLabelChooseNextComboBoxOption: 'ChooseNextComboBoxOption',
        txtDescriptionChooseNextComboBoxOption: 'Description ChooseNextComboBoxOption',
        txtLabelChoosePreviousComboBoxOption: 'ChoosePreviousComboBoxOption',
        txtDescriptionChoosePreviousComboBoxOption: 'Description ChoosePreviousComboBoxOption',
        txtLabelInsertLineBreakMultilineForm: 'InsertLineBreakMultilineForm',
        txtDescriptionInsertLineBreakMultilineForm: 'Description InsertLineBreakMultilineForm',
        txtLabelInsertEquation: 'InsertEquation',
        txtDescriptionInsertEquation: 'Description InsertEquation',
        txtLabelEmDash: 'EmDash',
        txtDescriptionEmDash: 'Description EmDash',
        txtLabelEnDash: 'EnDash',
        txtDescriptionEnDash: 'Description EnDash',
        txtLabelCopyrightSign: 'CopyrightSign',
        txtDescriptionCopyrightSign: 'Description CopyrightSign',
        txtLabelEuroSign: 'EuroSign',
        txtDescriptionEuroSign: 'Description EuroSign',
        txtLabelRegisteredSign: 'RegisteredSign',
        txtDescriptionRegisteredSign: 'Description RegisteredSign',
        txtLabelTrademarkSign: 'TrademarkSign',
        txtDescriptionTrademarkSign: 'Description TrademarkSign',
        txtLabelHorizontalEllipsis: 'HorizontalEllipsis',
        txtDescriptionHorizontalEllipsis: 'Description HorizontalEllipsis',
        txtLabelReplaceUnicodeToSymbol: 'ReplaceUnicodeToSymbol',
        txtDescriptionReplaceUnicodeToSymbol: 'Description ReplaceUnicodeToSymbol',
        txtLabelSoftHyphen: 'SoftHyphen',
        txtDescriptionSoftHyphen: 'Description SoftHyphen',
        txtLabelSpeechWorker: 'SpeechWorker',
        txtDescriptionSpeechWorker: 'Description SpeechWorker',

    },  Common.Views.ShortcutsDialog || {}))
});