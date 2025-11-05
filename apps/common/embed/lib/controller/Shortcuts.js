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


+function() {
    !window.common && (window.common = {});
    !common.controller && (common.controller = {});

    common.controller.Shortcuts = new(function() {
        var localStorageKey = '',
            actionsMap = {},
            api = null;


        var setApi = function(newApi) {
            api = newApi;

            if(window.DE) {
                localStorageKey = 'de-shortcuts';
            } else if(window.PDFE) {
                localStorageKey = 'pdfe-shortcuts';
            } else if(window.PE) {
                localStorageKey = 'pe-shortcuts';
            } else if(window.SSE) {
                localStorageKey = 'sse-shortcuts';
            } else if(window.VE) {
                localStorageKey = 've-shortcuts';
            }

            _fillActionsMap();
            api && _applyShortcutsInSDK();
        };

        var _keyCodeToKeyName = function(code) {
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
                44: 'PrintScreen',
                45: 'Insert',
                46: 'Delete',
                91: 'Meta',
                93: 'ContextMenu',
                96: "Num 0",
                97: "Num 1",
                98: "Num 2",
                99: "Num 3",
                100: "Num 4",
                101: "Num 5",
                102: "Num 6",
                103: "Num 7",
                104: "Num 8",
                105: "Num 9",
                106: "Num *",
                107: "Num +",
                108: "Num Enter",
                109: "Num -",
                110: "Num .",
                111: "Num /",
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
                144: 'NumLock',
                145: 'ScrollLock',
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
        };
        
        var _getDefaultShortcutActions = function() {
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
        };

        var _fillActionsMap = function() {
            actionsMap = {};
            
            const shortcutActions = _getDefaultShortcutActions();
            const unlockedTypes = Asc.c_oAscUnlockedShortcutActionTypes || {};
            for (let actionName in shortcutActions) {
                const type = shortcutActions[actionName];
                actionsMap[type] = {
                    action: {
                        name: actionName,
                        type: type,
                        isLocked: !unlockedTypes[type]
                    },
                    shortcuts: []
                }
            }

            pairs(Asc.c_oAscDefaultShortcuts).forEach(function(item) {
                const actionType = item[0];
                const shortcuts = item[1];
                const actionItem = actionsMap[actionType];

                if(actionItem) {
                    actionItem.shortcuts = shortcuts.map(function(ascShortcut) {
                        return {
                            keys: _getAscShortcutKeys(ascShortcut),
                            isCustom: false,
                            ascShortcut: ascShortcut,
                        }
                    });
                }
            });

            let removableIndexes = {};
            pairs(_getModifiedShortcuts()).forEach(function(item) {
                const actionType = item[0];
                const shortcuts = item[1];
                const actionItem = actionsMap[actionType];
                
                if(actionItem) {
                    shortcuts.forEach(function(ascShortcut) {
                        const ascShortcutIndex = ascShortcut.asc_GetShortcutIndex();
                        const defaultShortcutIndex = findIndex(actionItem.shortcuts, function(shortcut) { 
                            return shortcut.ascShortcut.asc_GetShortcutIndex() == ascShortcutIndex;
                        });

                        if(defaultShortcutIndex != -1) {
                            actionItem.shortcuts[defaultShortcutIndex].ascShortcut = ascShortcut;
                        } else {
                            removableIndexes[ascShortcutIndex] = actionType;
                            actionItem.shortcuts.push({
                                keys: _getAscShortcutKeys(ascShortcut),
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
                    const foundIndex = findIndex(shortcuts, function(shortcut) {
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
        };

        var _applyShortcutsInSDK = function() {
            const applyMethod = function(storage) {
                storage = JSON.parse(storage || common.localStorage.getItem(localStorageKey) || "{}");
                for (const actionType in storage) {
                    storage[actionType] = storage[actionType].map(function(ascShortcutJson) {
                        const ascShortcut = new Asc.CAscShortcut();
                        ascShortcut.asc_FromJson(ascShortcutJson);
                        return ascShortcut;
                    });
                }

                api.asc_resetAllShortcutTypes();
                
                const modifiedShortcuts = flatten(values(storage));
                if(modifiedShortcuts.length) {
                    api.asc_applyAscShortcuts(modifiedShortcuts);
                }
            };

            $(window).on('storage', function (e) {
                if(e.key == localStorageKey) {
                    applyMethod(e.originalEvent.newValue);
                    _fillActionsMap();
                }
            });

            applyMethod();
        };


        /**
         * Retrieves user-modified shortcuts from localStorage.
         * @returns {Object<number, CAscShortcut[]>}
         *  An object where keys are action types and values are arrays of ascShortcut instances.
        */
        var _getModifiedShortcuts = function() {
            const storage = JSON.parse(common.localStorage.getItem(localStorageKey) || "{}");
            for (const actionType in storage) {
                storage[actionType] = storage[actionType].map(function(ascShortcutJson) {
                    const ascShortcut = new Asc.CAscShortcut();
                    ascShortcut.asc_FromJson(ascShortcutJson);
                    return ascShortcut;
                });
            }
            return storage;
        };

    
        var _getAscShortcutKeys = function(ascShortcut) {
            const keys = [];
            ascShortcut.asc_IsCommand() && keys.push('⌘');
            ascShortcut.asc_IsCtrl() && keys.push('Ctrl');
            ascShortcut.asc_IsAlt() && keys.push('Alt');
            ascShortcut.asc_IsShift() && keys.push('Shift');
            keys.push(_keyCodeToKeyName(ascShortcut.asc_GetKeyCode()));
            return keys;
        };


        // Utils
        var pairs = function(obj)  {
            var result = [];
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result.push([key, obj[key]]);
                }
            }
            return result;
        };

        var flatten = function(array) {
            var result = [];

            function flat(arr) {
                for (var i = 0; i < arr.length; i++) {
                var value = arr[i];
                if (Array.isArray(value)) {
                    flat(value);
                } else {
                    result.push(value);
                }
                }
            }

            flat(array);
            return result;
        };

        var values = function(obj) {
            var result = [];
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result.push(obj[key]);
                }
            }
            return result;
        };

        var findIndex = function(array, predicate) {
            for (var i = 0; i < array.length; i++) {
                if (predicate(array[i], i, array)) {
                return i;
                }
            }
            return -1;
        };

        return {
            setApi: setApi
        }
    });
}();