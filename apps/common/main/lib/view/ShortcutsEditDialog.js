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
 *  ShortcutsEditDialog.js
 *
 *  Created on 23/06/25
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    Common.Views.ShortcutsEditDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            height: 'auto',
            contentWidth: 268,
            contentHeight: 'auto',
            separator: false
        },

        initialize : function(options) {
            _.extend(this.options, {
                id: 'shortcut-edit-gialog',
                title: this.txtTitle,
                contentStyle: 'padding: 16px 16px 0;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<label id="action-label">',
                            '<span><%= scope.txtAction %>: </span>',
                            '<span id="action-label-name"><%= options.action.name %></span>',
                        '</label>',
                        '<div id="shortcuts-list"></div>',
                        '<div id="buttons-row">',
                            '<label id="new-shortcut-btn" class="link"><%= scope.txtNewShortcut %></label>',
                            '<label id="reset-btn" class="link"><%= scope.txtRestoreToDefault %></label>',
                        '</div>',
                    '</div>'
                ].join(''))({scope: this, options: options}),
            }, options);
    
            const app = (window.DE || window.PE || window.SSE || window.PDFE || window.VE);
            this._shortcutsController = app.getController('Common.Controllers.Shortcuts'); 
            this._prevKeysForActiveInput = [];

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            this.newShortcutsBtn = this.$window.find('#new-shortcut-btn');
            this.newShortcutsBtn.on('click', _.bind(this.onAddShortcut, this));

            this.resetBtn = this.$window.find('#reset-btn');
            this.resetBtn.on('click', _.bind(this.onReset, this));

            this.scrollerOptions = {
                el: this.$window.find('#shortcuts-list'),
                wheelSpeed: 8,
                alwaysVisibleY: true
            };
            this.scroller = new Common.UI.Scroller(this.scrollerOptions);

            this._setDefaults();
        },

        getFocusedComponents: function() {
            const dynamicComponents = [];
            this.shortcutsCollection.each(function(record) {
                dynamicComponents.push(record.get('keysInput'), record.get('removeBtn'));
            });
            return dynamicComponents.concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function() {
            return this.shortcutsCollection.at(0).get('keysInput');
        },

        _setDefaults: function() {
            this.shortcutsCollection = new Backbone.Collection([]);
            this.shortcutsCollection.on('reset', function(newCollection, details) {
                this._renderShortcutsList(details.previousModels);
            }, this);
            this.shortcutsCollection.on('add', function(record, newCollection) {
                const prevCollection = newCollection.filter(function(item) { return item != record });
                this._renderShortcutsList(prevCollection);
            }, this);
             this.shortcutsCollection.on('remove', function(record, newCollection) {
                const prevCollection = newCollection.toArray();
                prevCollection.push(record);
                this._renderShortcutsList(prevCollection);
            }, this);
            this.shortcutsCollection.on('add remove reset change:keys', this.renderShortcutsWarning, this);

            //Get shortcuts for the current action and copy the instances so as not to modify the original instances
            let shortcuts = _.filter(this._getOriginalShortcuts(), function(shortcut) {
                return !shortcut.ascShortcut.asc_IsHidden();
            });
            shortcuts = shortcuts.map(function(shortcut) {
                const copyAscShortcut = new Asc.CAscShortcut();
                copyAscShortcut.asc_FromJson(shortcut.ascShortcut.asc_ToJson());
                return {
                    keys: shortcut.keys,
                    ascShortcut: copyAscShortcut
                };
            });
            this.shortcutsCollection.reset(shortcuts);
            if(this.shortcutsCollection.length == 0) {
                this.onAddShortcut();
            }
        },

        _getActionsMap: function() {
            return this._shortcutsController.getActionsMap();
        },

        _getOriginalShortcuts: function() {
            return this._getActionsMap()[this.options.action.type].shortcuts;
        },

        // Is this shortcut default for this action?
        _isDefaultShortcut: function(ascShortcut) {
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
        _findAssignedActions: function(ascShortcut, extraAction) {
            const shortcutIndex = ascShortcut.asc_GetShortcutIndex();
            const foundItems = [];
            const values = _.values(this._getActionsMap());

            for (let i = 0; i < values.length; i++) {
                const item = {
                    action: values[i].action,
                    shortcuts: values[i].shortcuts
                };

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
        _getDefaultShortcuts: function() {
            const me = this;
            const ascShortcuts = Asc.c_oAscDefaultShortcuts[this.options.action.type];
            return ascShortcuts.map(function(ascShortcut) {
                const copyAscShortcut = new Asc.CAscShortcut();
                copyAscShortcut.asc_FromJson(ascShortcut.asc_ToJson());
                copyAscShortcut.asc_SetIsHidden(false);
                return {
                    keys: me._shortcutsController._getAscShortcutKeys(copyAscShortcut),
                    ascShortcut: copyAscShortcut
                }
            });
        },

        _renderShortcutsList: function(prevCollection) {
            const me = this;

            this.$window.find('#shortcuts-list').empty();
            this.shortcutsCollection.each(function(item, index) {
                const ascShortcut = item.get('ascShortcut');
                const isLocked = ascShortcut.asc_IsLocked();
                const keysStr = item.get('keys').join(' + ');
                const $item = $(
                    '<div class="item ' + (index == 0 ? 'first' : '') + '">' +
                        '<div class="keys-input"></div>' +
                        (isLocked
                            ? '<button type="button" class="btn-toolbar">' +
                                '<i class="icon toolbar__icon btn-menu-about">&nbsp;</i>' +
                            '</button>'
                            : '<button type="button" class="btn-toolbar remove-btn">' +
                                '<i class="icon toolbar__icon btn-cc-remove">&nbsp;</i>' +
                            '</button>'
                        ) +
                    '</div>'
                );

                // if(me.shortcutsCollection.length == 1) {
                //     $item.find('.remove-btn').attr('disabled', true).addClass('disabled');
                // }
                me.$window.find('#shortcuts-list').append($item);   

                const keysInput = new Common.UI.InputField({
                    el          : $item.find('.keys-input'),
                    value       : keysStr,
                    editable    : false,
                    placeHolder : me.txtInputPlaceholder,
                    disabled    : isLocked
                });
                const removeButton = new Common.UI.Button({
                    el: $item.find('.remove-btn'),
                });
                item.set({ keysInput: keysInput, removeBtn: removeButton });

                const $keysInput = $item.find('.keys-input input'); 
                $keysInput.on('keydown', function(e) {
                    const alowedSingleKeys = [
                        Common.UI.Keys.F1, Common.UI.Keys.F2, Common.UI.Keys.F3, Common.UI.Keys.F4, Common.UI.Keys.F5,
                        Common.UI.Keys.F6, Common.UI.Keys.F7, Common.UI.Keys.F8, Common.UI.Keys.F9, Common.UI.Keys.F10,
                        Common.UI.Keys.F11, Common.UI.Keys.F12,Common.UI.Keys.INSERT, Common.UI.Keys.HOME,
                        Common.UI.Keys.PAGEUP, Common.UI.Keys.DELETE, Common.UI.Keys.END, Common.UI.Keys.PAGEDOWN,
                        Common.UI.Keys.LEFT, Common.UI.Keys.UP, Common.UI.Keys.RIGHT, Common.UI.Keys.DOWN 
                    ];

                    const forbiddensKeys = [Common.UI.Keys.ESC, Common.UI.Keys.TAB];
                    if(!Common.Utils.isMac) {
                        forbiddensKeys.push(91);        //Meta (Super, Win)
                    }

                    if (forbiddensKeys.includes(e.keyCode)) {
                        // Restore previous input state when press Tab
                        if(e.keyCode == Common.UI.Keys.TAB && me._prevKeysForActiveInput.length) {
                            item.set('keys', me._prevKeysForActiveInput);
                            $item.find('input').val(me._prevKeysForActiveInput.join(' + '));
                        }
                        return;
                    }

                    e.stopPropagation();
                    e.preventDefault();

                    if(!alowedSingleKeys.includes(e.keyCode) && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
                        return;
                    }

                    const keys = [];

                    if (e.ctrlKey) keys.push('Ctrl');
                    if (e.shiftKey) keys.push('Shift');
                    if (e.altKey) keys.push('Alt');
                    if (e.metaKey && Common.Utils.isMac) keys.push('⌘');

                    if (![Common.UI.Keys.CTRL, Common.UI.Keys.SHIFT, Common.UI.Keys.ALT, 91].includes(e.keyCode)) {
                        const app = (window.DE || window.PE || window.SSE || window.PDFE || window.VE);
                        keys.push(app.getController('Common.Controllers.Shortcuts').keyCodeToKeyName(e.keyCode));
                        ascShortcut.asc_SetKeyCode(e.keyCode);
                    } else {
                        ascShortcut.asc_SetKeyCode(null);
                    }

                    ascShortcut.asc_SetIsCtrl(!!e.ctrlKey);
                    ascShortcut.asc_SetIsShift(!!e.shiftKey);
                    ascShortcut.asc_SetIsAlt(!!e.altKey);
                    ascShortcut.asc_SetIsCommand(!!e.metaKey && Common.Utils.isMac);

                    item.set('keys', keys);
                    $item.find('input').val(keys.join(' + '));
                });


                const removeKeysIfOnlyModifiers = function(removedKeys) {
                    const modifierKeys = ['Ctrl', 'Shift', 'Alt', '⌘'];
                    const keys = item.get('keys');
                    const hasExtra = _.some(keys, function(k) {
                        return !_.contains(modifierKeys, k);
                    });

                    if (!hasExtra && removedKeys && removedKeys.length) {
                        const filteredKeys = keys.filter(function(k) {
                            return !_.contains(removedKeys, k);
                        });

                        item.set('keys', filteredKeys);
                        $item.find('input').val(filteredKeys.join(' + '));
                    }
                };

                $keysInput.on('keyup', function(e) {
                    const modifierKeyMap = {
                        [Common.UI.Keys.CTRL]: 'Ctrl',
                        [Common.UI.Keys.ALT]: 'Alt',
                        [Common.UI.Keys.SHIFT]: 'Shift',
                        91: '⌘'
                    };
                    const modifierKey = modifierKeyMap[e.keyCode];
                    removeKeysIfOnlyModifiers(modifierKey ? [modifierKey] : []);
                    if(!modifierKey) {
                        me._prevKeysForActiveInput = item.get('keys');
                    }
                });

                $keysInput.on('focusin', function() {
                    me._prevKeysForActiveInput = item.get('keys');
                });

                $keysInput.on('focusout', function() {
                    me._prevKeysForActiveInput = [];
                    removeKeysIfOnlyModifiers(item.get('keys'));
                });

                $item.find('.remove-btn').on('click', function() {
                    me.shortcutsCollection.remove(item);
                    if(me.shortcutsCollection.length == 0) {
                        me.onAddShortcut();
                    }
                    me.$window.find('#shortcuts-list .item input').last().focus();
                });
            });
            this.fixHeight(true);
            this.scroller.update(this.scrollerOptions);

            //Update focus controll
            Common.UI.FocusManager.remove(this, 0, prevCollection.length * 2 + 2);
            Common.UI.FocusManager.add(this, this.getFocusedComponents());
        },
        
        renderShortcutsWarning: function() {
            const me = this;
            let isButtonDisabled = false;

            this.shortcutsCollection.each(function(item) {
                const ascShortcut = item.get('ascShortcut');
                const assignedActionNames = [];
                const assignedActions = me._findAssignedActions(ascShortcut, {
                    actionType: me.options.action.type,
                    shortcuts: me.shortcutsCollection.toJSON().slice(0, _.indexOf(me.shortcutsCollection.models, item))
                });
                const isDefaultShortcut = me._isDefaultShortcut(ascShortcut);
                const isDisabled = !isDefaultShortcut && 
                    _.some(assignedActions, function(action) { return action.isLocked; });
                
                isButtonDisabled = isButtonDisabled || isDisabled;

                for (let i = 0; i < assignedActions.length; i++) {
                    const action = assignedActions[i];
                    if(action.isLocked == isDisabled) {
                        assignedActionNames.push('“' + action.name + '”');
                    } 
                }

                let txtKey = null;
                if (assignedActionNames.length === 1) {
                    txtKey = isDisabled ? 'txtInputWarnOneLocked' : 'txtInputWarnOne';
                } else if (assignedActionNames.length > 1) {
                    txtKey = isDisabled ? 'txtInputWarnManyLocked' : 'txtInputWarnMany';
                }
                item.get('keysInput').showWarning(
                    txtKey
                        ? [me[txtKey].replace('%1', assignedActionNames.join(', '))]
                        : null
                );
            });
            this.getFooterButtons()[0].setDisabled(isButtonDisabled);
        },
        
        onAddShortcut: function() {
            const lastShortcutRecord = this.shortcutsCollection.at(this.shortcutsCollection.length - 1);
            if(!lastShortcutRecord || lastShortcutRecord.get('keys').length) {
                this.shortcutsCollection.add({
                    keys: [],
                    ascShortcut: new Asc.CAscShortcut(this.options.action.type)
                });
            }
            this.$window.find('#shortcuts-list .item input').last().focus();
        },

        onReset: function() {
            const me = this;

            Common.UI.warning({
                title: this.txtRestoreToDefault,
                msg: this.txtRestoreDescription.replace('%1', me.options.action.name) + '<br/>' +
                    this.txtRestoreContinue,
                buttons: ['ok', 'cancel'],
                width: 400,
                callback: function(btn) {
                    if(btn == 'ok') {
                        const shortcuts = me._getDefaultShortcuts();
                        me.shortcutsCollection.reset(shortcuts);
                    }
                }
            });
        },

        onDlgBtnClick: function(event) {
            let state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                const seen = {};
                const filteredShortcuts = [];

                (this.shortcutsCollection.toJSON() || []).forEach(function(item) {
                    if (!item.keys.length) return;

                    let idx = item.ascShortcut.asc_GetShortcutIndex();
                    if (seen[idx]) return;

                    seen[idx] = true;
                    filteredShortcuts.push({
                        keys: item.keys,
                        ascShortcut: item.ascShortcut
                    });
                });

                this._shortcutsController.updateShortcutsForAction(this.options.action.type, filteredShortcuts);
            }

            this.close();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        txtTitle: 'Edit shortcut',
        txtAction: 'Action',
        txtInputPlaceholder: 'Type desired shortcut',
        txtInputWarnOne: 'The shortcut used by action %1',
        txtInputWarnOneLocked: 'The shortcut used by action %1 and can’t be changed',
        txtInputWarnMany: 'The shortcut used by actions %1',
        txtInputWarnManyLocked: 'The shortcut used by actions %1 and can’t be changed',
        txtNewShortcut: 'New shortcut',
        txtRestoreToDefault: 'Restore to default',
        txtTypeDesiredShortcut: 'Type desired shortcut',
        txtRestoreDescription: 'All shortcuts for action “%1” will be restored to deafult.',
        txtRestoreContinue: 'Do you want to continue?'

    },  Common.Views.ShortcutsEditDialog || {}))
});