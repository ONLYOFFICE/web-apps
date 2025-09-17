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
 * Created on 1/9/2025.
 */


define([
    'core'
], function () {
    'use strict';

    Common.Controllers.Shortcuts = Backbone.Controller.extend(_.extend({
        initialize: function() {
            this.localStorageKey = '';
            if(window.DE) {
                this.localStorageKey = 'de-shortcuts';
            } else if(window.PDFE) {
                this.localStorageKey = 'pdfe-shortcuts';
            } else if(window.PE) {
                this.localStorageKey = 'pe-shortcuts';
            } else if(window.SSE) {
                this.localStorageKey = 'SSE-shortcuts';
            } else if(window.VE) {
                this.localStorageKey = 've-shortcuts';
            }

            this.eventsMap = {};
            this._fillActionsMap();
        },

        setApi: function(api) {
            this.api = api;

            api && this._applyShortcutsInSDK();

            return this;
        },

        keyCodeToKeyName: function(code) {
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

        resetAllShortcuts: function() {
            const me = this;

            this.api.asc_resetAllShortcutTypes();
            for (const actionType in Asc.c_oAscDefaultShortcuts) {
                const actionItem = this.getActionsMap()[actionType];
                actionItem.shortcuts = Asc.c_oAscDefaultShortcuts[actionType].map(function(ascShortcut) {
                    return {
                        keys: me._getAscShortcutKeys(ascShortcut),
                        isCustom: false,
                        ascShortcut: ascShortcut,
                    }
                });
            }

            this._eventsTrigger();
            Common.localStorage.setItem(this.localStorageKey, '');
            Common.NotificationCenter.trigger('shortcuts:update');
        },

        updateShortcutsForAction: function(actionType, updatedShortcuts) {
            let resultShortcuts = [];
            const originalShortcuts = this.getActionsMap()[actionType].shortcuts;

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

            const action = this.getActionsMap()[actionType];
            resultShortcuts = resultShortcuts.sort(this._sortComparator);
            action && (action.shortcuts = resultShortcuts);

            // Remove shortcuts from other actions if they conflict with updated shortcuts
            const removableIndexes = updatedShortcuts.map(function(item) { 
                return item.ascShortcut.asc_GetShortcutIndex()
            });
            const removableFromStorage = {};
            for (const type in this.getActionsMap()) {
                if(removableIndexes.length == 0) break;
                if(type == actionType) continue;

                const shortcuts = this.getActionsMap()[type].shortcuts;
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

            this.api.asc_applyAscShortcuts(resultShortcuts.map(function(shortcut) { 
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
            this._saveModifiedShortcuts(savedInStorage, removableFromStorage);
            
            Common.NotificationCenter.trigger('shortcuts:update');
            this._eventsTrigger([actionType].concat(_.keys(removableFromStorage)));
        },

        getActionsMap: function() {
            return this.actionsMap;
        },

        getDefaultShortcutActions: function() {
            if(window.DE || window.PDFE) {
                return Asc.c_oAscDocumentShortcutType;
            } else if(window.PE) {
                return Asc.c_oAscPresentationShortcutType;
            } else if(window.SSE) {
                return Asc.c_oAscSpreadsheetShortcutType;
            } else if(window.VE) {
                return Asc.c_oAscDiagramShortcutType;
            }
            return {};
        },

        /**
         * Returns a list of shortcuts for the given action type.
         *
         * @param {string|number} actionType
         * The action type identifier. Can be:
         * - `string` — action type name ('Save', 'Undo', 'Copy' and so on)
         * - `number` — numeric action type id
         *
         * @returns {Array<{keys: string[], isCustom: boolean, ascShortcut: CAscShortcut}>|null}
         * 
         * @example
         * getShortcutsByActionType('Save');
         * getShortcutsByActionType(7);
         */
        getShortcutsByActionType: function(actionType, withHidden) {
            const actionTypeNumber = (typeof actionType === 'number')
                ? actionType
                : this.getDefaultShortcutActions()[actionType];
            const actionItem = this.actionsMap[actionTypeNumber];
            let shortcuts = actionItem ? actionItem.shortcuts : null;
            if(!withHidden && shortcuts) {
                shortcuts = shortcuts.filter(function(shortcut) {
                    return !shortcut.ascShortcut.asc_IsHidden();
                });
            } 
            return shortcuts;
        },

        /**
         * Updates button hints for shortcuts.
         *
         * For each action type, finds the first visible shortcut (non-hidden)
         * and appends its key combination to the base label. Then applies the
         * updated hint to the button or via a custom callback.
         *
         * @param {Object<string, {
         *   btn: Object,
         *   label: string,
         *   applyCallback?: function(Object, string):void,
         *   ignoreUpdates?: boolean
         * }>} shortcutHints
         *
         * An object where:
         * - key is the action type (actionType),
         * - value is a config object:
         *
         *   - `btn` {Object} — button object that provides `updateHint(string)` method.
         *   - `label` {string} — the base label text for the hint.
         *   - `applyCallback` [optional] — custom function to apply the generated hint text.
         *      Receives `(item, hintText)` as arguments.
         *   - `ignoreUpdates` [optional] — if `true`, will not be updated when shortcuts are updated
         *
         * @example
         * updateShortcutHints({
         *   EditUndo: {
         *     btn: btnUndo,
         *     label: 'Undo'
         *   },
         *   EditRedo: {
         *     label: 'Redo',
         *     applyCallback: function(item, hintText) {
         *       console.log('Custom hint:', text);
         *     },
         *     ignoreUpdates: true
         *   }
         * });
         */
        updateShortcutHints: function(shortcutHints) {
            for (const actionType in shortcutHints) {
                const item = shortcutHints[actionType];
                if(item) {
                    const callback = function() {
                        const defaultShortcutsActions = this.getDefaultShortcutActions();
                        const type = defaultShortcutsActions[actionType];
                        const action = type ? this.actionsMap[type] : null;
                        if(action) {
                            const firstShortcut = _.find(action.shortcuts, function(shortcut) {
                                return !shortcut.ascShortcut.asc_IsHidden();
                            });
                            const hintText = (item.label || '') + (firstShortcut ? ' (' + firstShortcut.keys.join('+') + ')' : '');
                            
                            if(item.applyCallback) {
                                item.applyCallback(item, hintText);
                            } else {
                                item.btn.updateHint(hintText);
                            }
                        }
                    }.bind(this);

                    callback();
                    if(!item.ignoreUpdates) {
                        !this.eventsMap[actionType] && (this.eventsMap[actionType] = []);
                        this.eventsMap[actionType].push(callback);
                    }
                }
            }
        },

        _getDefaultShortcutActionsInvert: function() {
            if(!this._defaultShortcutsActionsInvert) {
                this._defaultShortcutsActionsInvert = _.invert(this.getDefaultShortcutActions());
            }
            return this._defaultShortcutsActionsInvert;
        },

        _eventsTrigger: function(actionTypes) {
            const me = this;
            let lists = [];
            if(actionTypes) {
                lists = actionTypes.map(function(type) {
                    type = (typeof +type === 'number')
                        ? me._getDefaultShortcutActionsInvert()[type]
                        : type;
                    return me.eventsMap[type];
                });
            } else {
                lists =  _.values(this.eventsMap);
            }

            _.each(lists, function(callbacks) {
                _.each(callbacks, function(cb) { 
                    cb && cb(); 
                });
            });
        },

        _fillActionsMap: function() {
            this.actionsMap = {};
            
            const me = this;
            const shortcutActions = this.getDefaultShortcutActions();
            const unlockedTypes = Asc.c_oAscUnlockedShortcutActionTypes || {};
            for (let actionName in shortcutActions) {
                const type = shortcutActions[actionName];
                this.actionsMap[type] = {
                    action: {
                        name: this['txtLabel' + actionName],
                        description: this['txtDescription' + actionName],
                        type: type,
                        isLocked: !unlockedTypes[type]
                    },
                    shortcuts: []
                }
            }

            _.pairs(Asc.c_oAscDefaultShortcuts).forEach(function(item) {
                const actionType = item[0];
                const shortcuts = item[1];
                const actionItem = me.actionsMap[actionType];

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
            _.pairs(me._getModifiedShortcuts()).forEach(function(item) {
                const actionType = item[0];
                const shortcuts = item[1];
                const actionItem = me.actionsMap[actionType];
                
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

            for (const actionType in this.actionsMap) {
                const item = this.actionsMap[actionType];
                const shortcuts = this.actionsMap[actionType].shortcuts;
                if(shortcuts.length == 0 && item.action.isLocked) {
                    // Delete actions if it has no shortcuts and the action is locked
                    delete this.actionsMap[actionType];
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
        },

        _applyShortcutsInSDK: function() {
            const applyMethod = function(storage) {
                storage = JSON.parse(storage || Common.localStorage.getItem(this.localStorageKey) || "{}");
                for (const actionType in storage) {
                    storage[actionType] = storage[actionType].map(function(ascShortcutJson) {
                        const ascShortcut = new Asc.CAscShortcut();
                        ascShortcut.asc_FromJson(ascShortcutJson);
                        return ascShortcut;
                    });
                }

                this.api.asc_resetAllShortcutTypes();
                
                const modifiedShortcuts = _.flatten(_.values(storage));
                if(modifiedShortcuts.length) {
                    this.api.asc_applyAscShortcuts(modifiedShortcuts);
                }
            }.bind(this);

            $(window).on('storage', function (e) {
                if(e.key == this.localStorageKey) {
                    applyMethod(e.originalEvent.newValue);
                    this._fillActionsMap();
                    this._eventsTrigger();
                    Common.NotificationCenter.trigger('shortcuts:update');
                }
            }.bind(this))

            applyMethod();
        },

        /**
         * Retrieves user-modified shortcuts from localStorage.
         * @returns {Object<number, CAscShortcut[]>}
         *  An object where keys are action types and values are arrays of ascShortcut instances.
        */
        _getModifiedShortcuts: function() {
            const storage = JSON.parse(Common.localStorage.getItem(this.localStorageKey) || "{}");
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
            Common.localStorage.setItem(this.localStorageKey, JSON.stringify(customShortcuts));
        },
        
        _getAscShortcutKeys: function(ascShortcut) {
            const keys = [];
            ascShortcut.asc_IsCommand() && keys.push('⌘');
            ascShortcut.asc_IsCtrl() && keys.push('Ctrl');
            ascShortcut.asc_IsAlt() && keys.push('Alt');
            ascShortcut.asc_IsShift() && keys.push('Shift');
            keys.push(this.keyCodeToKeyName(ascShortcut.asc_GetKeyCode()));
            return keys;
        },

        _sortComparator: function(first, second) {
            const priorityModifierKeys = ['asc_IsCommand', 'asc_IsCtrl', 'asc_IsAlt', 'asc_IsShift'];
            function getWeight(ascShortcut) {
                // Search for the first modifier key
                let keyIndex = priorityModifierKeys.length;
                for (let i = 0; i < priorityModifierKeys.length; i++) {
                    if (ascShortcut[priorityModifierKeys[i]]()) {
                        keyIndex = i;
                        break;
                    }
                }

                if (keyIndex === priorityModifierKeys.length) return -1;

                // Count extra modifier keys
                let extras = 0;
                for (let j = 0; j < priorityModifierKeys.length; j++) {
                    if (j !== keyIndex && ascShortcut[priorityModifierKeys[j]]()) extras++;
                }

                // weight = range for main key + “cost” of extra keys
                return keyIndex * 100 + extras;
            }
            let wFirst = getWeight(first.ascShortcut);
            let wSecond = getWeight(second.ascShortcut);

            if (wFirst !== wSecond) return wFirst - wSecond;

            return first.ascShortcut.asc_GetKeyCode() - second.ascShortcut.asc_GetKeyCode();
        },

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
        txtLabelGoToFirstSlide: 'GoToFirstSlide',
        txtDescriptionGoToFirstSlide: 'Description GoToFirstSlide',
        txtLabelGoToLastSlide: 'GoToLastSlide',
        txtDescriptionGoToLastSlide: 'Description GoToLastSlide',
        txtLabelGoToNextSlide: 'GoToNextSlide',
        txtDescriptionGoToNextSlide: 'Description GoToNextSlide',
        txtLabelGoToPreviousSlide: 'GoToPreviousSlide',
        txtDescriptionGoToPreviousSlide: 'Description GoToPreviousSlide',
        txtLabelNewSlide: 'NewSlide',
        txtDescriptionNewSlide: 'Description NewSlide',
        txtLabelRemoveSlide: 'RemoveSlide',
        txtDescriptionRemoveSlide: 'Description RemoveSlide',
        txtLabelDuplicate: 'Duplicate',
        txtDescriptionDuplicate: 'Description Duplicate',
        txtLabelMoveSlideUp: 'MoveSlideUp',
        txtDescriptionMoveSlideUp: 'Description MoveSlideUp',
        txtLabelMoveSlideDown: 'MoveSlideDown',
        txtDescriptionMoveSlideDown: 'Description MoveSlideDown',
        txtLabelMoveSlideToBegin: 'MoveSlideToBegin',
        txtDescriptionMoveSlideToBegin: 'Description MoveSlideToBegin',
        txtLabelMoveSlideToEnd: 'MoveSlideToEnd',
        txtDescriptionMoveSlideToEnd: 'Description MoveSlideToEnd',
        txtLabelGroup: 'Group',
        txtDescriptionGroup: 'Description Group',
        txtLabelUnGroup: 'UnGroup',
        txtDescriptionUnGroup: 'Description UnGroup',
        txtLabelDemonstrationStartPresentation: 'DemonstrationStartPresentation',
        txtDescriptionDemonstrationStartPresentation: 'Description DemonstrationStartPresentation',
        txtLabelDemonstrationGoToNextSlide: 'DemonstrationGoToNextSlide',
        txtDescriptionDemonstrationGoToNextSlide: 'Description DemonstrationGoToNextSlide',
        txtLabelDemonstrationGoToPreviousSlide: 'DemonstrationGoToPreviousSlide',
        txtDescriptionDemonstrationGoToPreviousSlide: 'Description DemonstrationGoToPreviousSlide',
        txtLabelDemonstrationGoToFirstSlide: 'DemonstrationGoToFirstSlide',
        txtDescriptionDemonstrationGoToFirstSlide: 'Description DemonstrationGoToFirstSlide',
        txtLabelDemonstrationGoToLastSlide: 'DemonstrationGoToLastSlide',
        txtDescriptionDemonstrationGoToLastSlide: 'Description DemonstrationGoToLastSlide',
        txtLabelDemonstrationClosePreview: 'DemonstrationClosePreview',
        txtDescriptionDemonstrationClosePreview: 'Description DemonstrationClosePreview',
        txtLabelUseDestinationTheme: 'UseDestinationTheme',
        txtDescriptionUseDestinationTheme: 'Description UseDestinationTheme',
        txtLabelKeepSourceFormat: 'KeepSourceFormat',
        txtDescriptionKeepSourceFormat: 'Description KeepSourceFormat',
        txtLabelPasteAsPicture: 'PasteAsPicture',
        txtDescriptionPasteAsPicture: 'Description PasteAsPicture',
        txtLabelKeepTextOnly: 'KeepTextOnly',
        txtDescriptionKeepTextOnly: 'Description KeepTextOnly',
        txtLabelSelectNextSlide: 'SelectNextSlide',
        txtDescriptionSelectNextSlide: 'Description SelectNextSlide',
        txtLabelSelectPreviousSlide: 'SelectPreviousSlide',
        txtDescriptionSelectPreviousSlide: 'Description SelectPreviousSlide',
        txtLabelSelectToFirstSlide: 'SelectToFirstSlide',
        txtDescriptionSelectToFirstSlide: 'Description SelectToFirstSlide',
        txtLabelSelectToLastSlide: 'SelectToLastSlide',
        txtDescriptionSelectToLastSlide: 'Description SelectToLastSlide',
        txtLabelEditDeselectAll: 'EditDeselectAll',
        txtDescriptionEditDeselectAll: 'Description EditDeselectAll',
        txtLabelShowParaMarks: 'ShowParaMarks',
        txtDescriptionShowParaMarks: 'Description ShowParaMarks',
        txtLabelBulletList: 'BulletList',
        txtDescriptionBulletList: 'Description BulletList',
        txtLabelGoToNextPlaceholder: 'GoToNextPlaceholder',
        txtDescriptionGoToNextPlaceholder: 'Description GoToNextPlaceholder',
        txtLabelMoveToStartContent: 'MoveToStartContent',
        txtDescriptionMoveToStartContent: 'Description MoveToStartContent',
        txtLabelMoveToEndContent: 'MoveToEndContent',
        txtDescriptionMoveToEndContent: 'Description MoveToEndContent',
        txtLabelDownloadAs: 'DownloadAs',
        txtDescriptionDownloadAs: 'Description DownloadAs',
        txtLabelCellMoveUp: 'CellMoveUp',
        txtDescriptionCellMoveUp: 'Description CellMoveUp',
        txtLabelCellMoveDown: 'CellMoveDown',
        txtDescriptionCellMoveDown: 'Description CellMoveDown',
        txtLabelCellMoveLeft: 'CellMoveLeft',
        txtDescriptionCellMoveLeft: 'Description CellMoveLeft',
        txtLabelCellMoveRight: 'CellMoveRight',
        txtDescriptionCellMoveRight: 'Description CellMoveRight',
        txtLabelCellMoveActiveCellDown: 'CellMoveActiveCellDown',
        txtDescriptionCellMoveActiveCellDown: 'Description CellMoveActiveCellDown',
        txtLabelCellMoveActiveCellUp: 'CellMoveActiveCellUp',
        txtDescriptionCellMoveActiveCellUp: 'Description CellMoveActiveCellUp',
        txtLabelCellMoveActiveCellRight: 'CellMoveActiveCellRight',
        txtDescriptionCellMoveActiveCellRight: 'Description CellMoveActiveCellRight',
        txtLabelCellMoveActiveCellLeft: 'CellMoveActiveCellLeft',
        txtDescriptionCellMoveActiveCellLeft: 'Description CellMoveActiveCellLeft',
        txtLabelCellMoveLeftNonBlank: 'CellMoveLeftNonBlank',
        txtDescriptionCellMoveLeftNonBlank: 'Description CellMoveLeftNonBlank',
        txtLabelCellMoveFirstColumn: 'CellMoveFirstColumn',
        txtDescriptionCellMoveFirstColumn: 'Description CellMoveFirstColumn',
        txtLabelCellMoveRightNonBlank: 'CellMoveRightNonBlank',
        txtDescriptionCellMoveRightNonBlank: 'Description CellMoveRightNonBlank',
        txtLabelCellMoveBottomNonBlank: 'CellMoveBottomNonBlank',
        txtDescriptionCellMoveBottomNonBlank: 'Description CellMoveBottomNonBlank',
        txtLabelCellMoveBottomEdge: 'CellMoveBottomEdge',
        txtDescriptionCellMoveBottomEdge: 'Description CellMoveBottomEdge',
        txtLabelCellMoveTopNonBlank: 'CellMoveTopNonBlank',
        txtDescriptionCellMoveTopNonBlank: 'Description CellMoveTopNonBlank',
        txtLabelCellMoveTopEdge: 'CellMoveTopEdge',
        txtDescriptionCellMoveTopEdge: 'Description CellMoveTopEdge',
        txtLabelCellMoveFirstCell: 'CellMoveFirstCell',
        txtDescriptionCellMoveFirstCell: 'Description CellMoveFirstCell',
        txtLabelCellMoveEndSpreadsheet: 'CellMoveEndSpreadsheet',
        txtDescriptionCellMoveEndSpreadsheet: 'Description CellMoveEndSpreadsheet',
        txtLabelPreviousWorksheet: 'PreviousWorksheet',
        txtDescriptionPreviousWorksheet: 'Description PreviousWorksheet',
        txtLabelNextWorksheet: 'NextWorksheet',
        txtDescriptionNextWorksheet: 'Description NextWorksheet',
        txtLabelNavigatePreviousControl: 'NavigatePreviousControl',
        txtDescriptionNavigatePreviousControl: 'Description NavigatePreviousControl',
        txtLabelNavigateNextControl: 'NavigateNextControl',
        txtDescriptionNavigateNextControl: 'Description NavigateNextControl',
        txtLabelSelectColumn: 'SelectColumn',
        txtDescriptionSelectColumn: 'Description SelectColumn',
        txtLabelSelectRow: 'SelectRow',
        txtDescriptionSelectRow: 'Description SelectRow',
        txtLabelSelectOneCellRight: 'SelectOneCellRight',
        txtDescriptionSelectOneCellRight: 'Description SelectOneCellRight',
        txtLabelSelectOneCellLeft: 'SelectOneCellLeft',
        txtDescriptionSelectOneCellLeft: 'Description SelectOneCellLeft',
        txtLabelSelectOneCellUp: 'SelectOneCellUp',
        txtDescriptionSelectOneCellUp: 'Description SelectOneCellUp',
        txtLabelSelectOneCellDown: 'SelectOneCellDown',
        txtDescriptionSelectOneCellDown: 'Description SelectOneCellDown',
        txtLabelSelectCursorBeginningRow: 'SelectCursorBeginningRow',
        txtDescriptionSelectCursorBeginningRow: 'Description SelectCursorBeginningRow',
        txtLabelSelectCursorEndRow: 'SelectCursorEndRow',
        txtDescriptionSelectCursorEndRow: 'Description SelectCursorEndRow',
        txtLabelSelectNextNonblankRight: 'SelectNextNonblankRight',
        txtDescriptionSelectNextNonblankRight: 'Description SelectNextNonblankRight',
        txtLabelSelectNextNonblankLeft: 'SelectNextNonblankLeft',
        txtDescriptionSelectNextNonblankLeft: 'Description SelectNextNonblankLeft',
        txtLabelSelectNextNonblankUp: 'SelectNextNonblankUp',
        txtDescriptionSelectNextNonblankUp: 'Description SelectNextNonblankUp',
        txtLabelSelectNextNonblankDown: 'SelectNextNonblankDown',
        txtDescriptionSelectNextNonblankDown: 'Description SelectNextNonblankDown',
        txtLabelSelectBeginningWorksheet: 'SelectBeginningWorksheet',
        txtDescriptionSelectBeginningWorksheet: 'Description SelectBeginningWorksheet',
        txtLabelSelectLastUsedCell: 'SelectLastUsedCell',
        txtDescriptionSelectLastUsedCell: 'Description SelectLastUsedCell',
        txtLabelSelectNearestNonblankRight: 'SelectNearestNonblankRight',
        txtDescriptionSelectNearestNonblankRight: 'Description SelectNearestNonblankRight',
        txtLabelSelectNonblankLeft: 'SelectNonblankLeft',
        txtDescriptionSelectNonblankLeft: 'Description SelectNonblankLeft',
        txtLabelSelectFirstColumn: 'SelectFirstColumn',
        txtDescriptionSelectFirstColumn: 'Description SelectFirstColumn',
        txtLabelSelectNearestNonblankDown: 'SelectNearestNonblankDown',
        txtDescriptionSelectNearestNonblankDown: 'Description SelectNearestNonblankDown',
        txtLabelSelectNearestNonblankUp: 'SelectNearestNonblankUp',
        txtDescriptionSelectNearestNonblankUp: 'Description SelectNearestNonblankUp',
        txtLabelSelectDownOneScreen: 'SelectDownOneScreen',
        txtDescriptionSelectDownOneScreen: 'Description SelectDownOneScreen',
        txtLabelSelectUpOneScreen: 'SelectUpOneScreen',
        txtDescriptionSelectUpOneScreen: 'Description SelectUpOneScreen',
        txtLabelPasteOnlyFormula: 'PasteOnlyFormula',
        txtDescriptionPasteOnlyFormula: 'Description PasteOnlyFormula',
        txtLabelPasteFormulaNumberFormat: 'PasteFormulaNumberFormat',
        txtDescriptionPasteFormulaNumberFormat: 'Description PasteFormulaNumberFormat',
        txtLabelPasteFormulaAllFormatting: 'PasteFormulaAllFormatting',
        txtDescriptionPasteFormulaAllFormatting: 'Description PasteFormulaAllFormatting',
        txtLabelPasteFormulaNoBorders: 'PasteFormulaNoBorders',
        txtDescriptionPasteFormulaNoBorders: 'Description PasteFormulaNoBorders',
        txtLabelPasteFormulaColumnWidth: 'PasteFormulaColumnWidth',
        txtDescriptionPasteFormulaColumnWidth: 'Description PasteFormulaColumnWidth',
        txtLabelTranspose: 'Transpose',
        txtDescriptionTranspose: 'Description Transpose',
        txtLabelPasteOnlyValue: 'PasteOnlyValue',
        txtDescriptionPasteOnlyValue: 'Description PasteOnlyValue',
        txtLabelPasteValueNumberFormat: 'PasteValueNumberFormat',
        txtDescriptionPasteValueNumberFormat: 'Description PasteValueNumberFormat',
        txtLabelPasteValueAllFormatting: 'PasteValueAllFormatting',
        txtDescriptionPasteValueAllFormatting: 'Description PasteValueAllFormatting',
        txtLabelPasteOnlyFormatting: 'PasteOnlyFormatting',
        txtDescriptionPasteOnlyFormatting: 'Description PasteOnlyFormatting',
        txtLabelPasteLink: 'PasteLink',
        txtDescriptionPasteLink: 'Description PasteLink',
        txtLabelEditOpenCellEditor: 'EditOpenCellEditor',
        txtDescriptionEditOpenCellEditor: 'Description EditOpenCellEditor',
        txtLabelToggleAutoFilter: 'ToggleAutoFilter',
        txtDescriptionToggleAutoFilter: 'Description ToggleAutoFilter',
        txtLabelOpenFilterWindow: 'OpenFilterWindow',
        txtDescriptionOpenFilterWindow: 'Description OpenFilterWindow',
        txtLabelFormatAsTableTemplate: 'FormatAsTableTemplate',
        txtDescriptionFormatAsTableTemplate: 'Description FormatAsTableTemplate',
        txtLabelCompleteCellEntryMoveDown: 'CompleteCellEntryMoveDown',
        txtDescriptionCompleteCellEntryMoveDown: 'Description CompleteCellEntryMoveDown',
        txtLabelCompleteCellEntryMoveUp: 'CompleteCellEntryMoveUp',
        txtDescriptionCompleteCellEntryMoveUp: 'Description CompleteCellEntryMoveUp',
        txtLabelCompleteCellEntryMoveRight: 'CompleteCellEntryMoveRight',
        txtDescriptionCompleteCellEntryMoveRight: 'Description CompleteCellEntryMoveRight',
        txtLabelCompleteCellEntryMoveLeft: 'CompleteCellEntryMoveLeft',
        txtDescriptionCompleteCellEntryMoveLeft: 'Description CompleteCellEntryMoveLeft',
        txtLabelCompleteCellEntryStay: 'CompleteCellEntryStay',
        txtDescriptionCompleteCellEntryStay: 'Description CompleteCellEntryStay',
        txtLabelFillSelectedCellRange: 'FillSelectedCellRange',
        txtDescriptionFillSelectedCellRange: 'Description FillSelectedCellRange',
        txtLabelCellStartNewLine: 'CellStartNewLine',
        txtDescriptionCellStartNewLine: 'Description CellStartNewLine',
        txtLabelCellEntryCancel: 'CellEntryCancel',
        txtDescriptionCellEntryCancel: 'Description CellEntryCancel',
        txtLabelClearActiveCellContent: 'ClearActiveCellContent',
        txtDescriptionClearActiveCellContent: 'Description ClearActiveCellContent',
        txtLabelClearSelectedCellsContent: 'ClearSelectedCellsContent',
        txtDescriptionClearSelectedCellsContent: 'Description ClearSelectedCellsContent',
        txtLabelOpenInsertCellsWindow: 'OpenInsertCellsWindow',
        txtDescriptionOpenInsertCellsWindow: 'Description OpenInsertCellsWindow',
        txtLabelOpenDeleteCellsWindow: 'OpenDeleteCellsWindow',
        txtDescriptionOpenDeleteCellsWindow: 'Description OpenDeleteCellsWindow',
        txtLabelCellInsertDate: 'CellInsertDate',
        txtDescriptionCellInsertDate: 'Description CellInsertDate',
        txtLabelCellInsertTime: 'CellInsertTime',
        txtDescriptionCellInsertTime: 'Description CellInsertTime',
        txtLabelCellAddSeparator: 'CellAddSeparator',
        txtDescriptionCellAddSeparator: 'Description CellAddSeparator',
        txtLabelAutoFill: 'AutoFill',
        txtDescriptionAutoFill: 'Description AutoFill',
        txtLabelMoveCharacterLeft: 'MoveCharacterLeft',
        txtDescriptionMoveCharacterLeft: 'Description MoveCharacterLeft',
        txtLabelMoveCharacterRight: 'MoveCharacterRight',
        txtDescriptionMoveCharacterRight: 'Description MoveCharacterRight',
        txtLabelMoveCursorLineUp: 'MoveCursorLineUp',
        txtDescriptionMoveCursorLineUp: 'Description MoveCursorLineUp',
        txtLabelMoveCursorLineDown: 'MoveCursorLineDown',
        txtDescriptionMoveCursorLineDown: 'Description MoveCursorLineDown',
        txtLabelSelectCharacterRight: 'SelectCharacterRight',
        txtDescriptionSelectCharacterRight: 'Description SelectCharacterRight',
        txtLabelSelectCharacterLeft: 'SelectCharacterLeft',
        txtDescriptionSelectCharacterLeft: 'Description SelectCharacterLeft',
        txtLabelMoveWordLeft: 'MoveWordLeft',
        txtDescriptionMoveWordLeft: 'Description MoveWordLeft',
        txtLabelMoveWordRight: 'MoveWordRight',
        txtDescriptionMoveWordRight: 'Description MoveWordRight',
        txtLabelSelectWordLeft: 'SelectWordLeft',
        txtDescriptionSelectWordLeft: 'Description SelectWordLeft',
        txtLabelSelectWordRight: 'SelectWordRight',
        txtDescriptionSelectWordRight: 'Description SelectWordRight',
        txtLabelMoveBeginningText: 'MoveBeginningText',
        txtDescriptionMoveBeginningText: 'Description MoveBeginningText',
        txtLabelMoveEndText: 'MoveEndText',
        txtDescriptionMoveEndText: 'Description MoveEndText',
        txtLabelSelectBeginningText: 'SelectBeginningText',
        txtDescriptionSelectBeginningText: 'Description SelectBeginningText',
        txtLabelSelectEndText: 'SelectEndText',
        txtDescriptionSelectEndText: 'Description SelectEndText',
        txtLabelMoveBeginningLine: 'MoveBeginningLine',
        txtDescriptionMoveBeginningLine: 'Description MoveBeginningLine',
        txtLabelMoveEndLine: 'MoveEndLine',
        txtDescriptionMoveEndLine: 'Description MoveEndLine',
        txtLabelSelectBeginningLine: 'SelectBeginningLine',
        txtDescriptionSelectBeginningLine: 'Description SelectBeginningLine',
        txtLabelSelectEndLine: 'SelectEndLine',
        txtDescriptionSelectEndLine: 'Description SelectEndLine',
        txtLabelRefreshSelectedPivots: 'RefreshSelectedPivots',
        txtDescriptionRefreshSelectedPivots: 'Description RefreshSelectedPivots',
        txtLabelRefreshAllPivots: 'RefreshAllPivots',
        txtDescriptionRefreshAllPivots: 'Description RefreshAllPivots',
        txtLabelSlicerClearSelectedValues: 'SlicerClearSelectedValues',
        txtDescriptionSlicerClearSelectedValues: 'Description SlicerClearSelectedValues',
        txtLabelSlicerSwitchMultiSelect: 'SlicerSwitchMultiSelect',
        txtDescriptionSlicerSwitchMultiSelect: 'Description SlicerSwitchMultiSelect',
        txtLabelFormatTableAddSummaryRow: 'FormatTableAddSummaryRow',
        txtDescriptionFormatTableAddSummaryRow: 'Description FormatTableAddSummaryRow',
        txtLabelOpenInsertFunctionDialog: 'OpenInsertFunctionDialog',
        txtDescriptionOpenInsertFunctionDialog: 'Description OpenInsertFunctionDialog',
        txtLabelCellInsertSumFunction: 'CellInsertSumFunction',
        txtDescriptionCellInsertSumFunction: 'Description CellInsertSumFunction',
        txtLabelRecalculateAll: 'RecalculateAll',
        txtDescriptionRecalculateAll: 'Description RecalculateAll',
        txtLabelRecalculateActiveSheet: 'RecalculateActiveSheet',
        txtDescriptionRecalculateActiveSheet: 'Description RecalculateActiveSheet',
        txtLabelShowFormulas: 'ShowFormulas',
        txtDescriptionShowFormulas: 'Description ShowFormulas',
        txtLabelCellEditorSwitchReference: 'CellEditorSwitchReference',
        txtDescriptionCellEditorSwitchReference: 'Description CellEditorSwitchReference',
        txtLabelOpenNumberFormatDialog: 'OpenNumberFormatDialog',
        txtDescriptionOpenNumberFormatDialog: 'Description OpenNumberFormatDialog',
        txtLabelCellGeneralFormat: 'CellGeneralFormat',
        txtDescriptionCellGeneralFormat: 'Description CellGeneralFormat',
        txtLabelCellCurrencyFormat: 'CellCurrencyFormat',
        txtDescriptionCellCurrencyFormat: 'Description CellCurrencyFormat',
        txtLabelCellPercentFormat: 'CellPercentFormat',
        txtDescriptionCellPercentFormat: 'Description CellPercentFormat',
        txtLabelCellExponentialFormat: 'CellExponentialFormat',
        txtDescriptionCellExponentialFormat: 'Description CellExponentialFormat',
        txtLabelCellDateFormat: 'CellDateFormat',
        txtDescriptionCellDateFormat: 'Description CellDateFormat',
        txtLabelCellTimeFormat: 'CellTimeFormat',
        txtDescriptionCellTimeFormat: 'Description CellTimeFormat',
        txtLabelCellNumberFormat: 'CellNumberFormat',
        txtDescriptionCellNumberFormat: 'Description CellNumberFormat',
        txtLabelMoveShapeLittleStepRight: 'MoveShapeLittleStepRight',
        txtDescriptionMoveShapeLittleStepRight: 'Description MoveShapeLittleStepRight',
        txtLabelMoveShapeLittleStepLeft: 'MoveShapeLittleStepLeft',
        txtDescriptionMoveShapeLittleStepLeft: 'Description MoveShapeLittleStepLeft',
        txtLabelMoveShapeLittleStepUp: 'MoveShapeLittleStepUp',
        txtDescriptionMoveShapeLittleStepUp: 'Description MoveShapeLittleStepUp',
        txtLabelMoveShapeLittleStepBottom: 'MoveShapeLittleStepBottom',
        txtDescriptionMoveShapeLittleStepBottom: 'Description MoveShapeLittleStepBottom',
        txtLabelMoveShapeBigStepLeft: 'MoveShapeBigStepLeft',
        txtDescriptionMoveShapeBigStepLeft: 'Description MoveShapeBigStepLeft',
        txtLabelMoveShapeBigStepRight: 'MoveShapeBigStepRight',
        txtDescriptionMoveShapeBigStepRight: 'Description MoveShapeBigStepRight',
        txtLabelMoveShapeBigStepUp: 'MoveShapeBigStepUp',
        txtDescriptionMoveShapeBigStepUp: 'Description MoveShapeBigStepUp',
        txtLabelMoveShapeBigStepBottom: 'MoveShapeBigStepBottom',
        txtDescriptionMoveShapeBigStepBottom: 'Description MoveShapeBigStepBottom',
        txtLabelMoveFocusNextObject: 'MoveFocusNextObject',
        txtDescriptionMoveFocusNextObject: 'Description MoveFocusNextObject',
        txtLabelMoveFocusPreviousObject: 'MoveFocusPreviousObject',
        txtDescriptionMoveFocusPreviousObject: 'Description MoveFocusPreviousObject',
        txtLabelDrawingAddTab: 'DrawingAddTab',
        txtDescriptionDrawingAddTab: 'Description DrawingAddTab',
        txtLabelAddLineBreak: 'AddLineBreak',
        txtDescriptionAddLineBreak: 'Description AddLineBreak',
        txtLabelRemoveGraphicalObject: 'RemoveGraphicalObject',
        txtDescriptionRemoveGraphicalObject: 'Description RemoveGraphicalObject',
        txtLabelExitAddingShapesMode: 'ExitAddingShapesMode',
        txtDescriptionExitAddingShapesMode: 'Description ExitAddingShapesMode'
        
    }, Common.Controllers.Shortcuts || {}));
});