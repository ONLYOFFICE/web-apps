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
 *  ShortcutEditDialog.js
 *
 *  Created on 23/06/25
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    Common.Views.ShortcutEditDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
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

            this.handler = options.handler;            
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            this.newShortcutsBtn = this.$window.find('#new-shortcut-btn');
            this.newShortcutsBtn.on('click', _.bind(this.onAddShortcut, this));

            this.resetBtn = this.$window.find('#reset-btn');
            this.resetBtn.on('click', _.bind(this.onReset, this));

            this._setDefaults();
        },

        getFocusedComponents: function() {
            return [].concat(this.getFooterButtons());
        },

        _setDefaults: function() {
            this.shortcutsCollection = new Backbone.Collection([]);
            this.shortcutsCollection.on('add remove reset', this._renderShortcutsList, this);
            this.shortcutsCollection.on('add remove reset change:keys', this.renderShortcutsWarning, this);

            this.shortcutsCollection.reset(this.options.shortcuts);
            if(this.shortcutsCollection.length == 0) {
                this.onAddShortcut();
            }
        },

        _renderShortcutsList: function(item) {
            const me = this;

            this.$window.find('#shortcuts-list').empty();
            this.shortcutsCollection.each(function(item) {
                const ascShortcut = item.get('ascShortcut');
                const isLocked = ascShortcut.asc_IsLocked();
                const keysStr = item.get('keys').join(' + ');
                const $item = $(
                    '<div class="item">' +
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
                item.set({ keysInput: keysInput });

                const $keysInput = $item.find('.keys-input input'); 
                $keysInput.on('keydown', function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    const keys = [];

                    if (e.ctrlKey) keys.push('Ctrl');
                    if (e.shiftKey) keys.push('Shift');
                    if (e.altKey) keys.push('Alt');
                    if (e.metaKey) keys.push('⌘');

                    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
                        keys.push(me.options.keyCodeToKeyName(e.keyCode));
                        ascShortcut.asc_SetKeyCode(e.keyCode);
                    } else {
                        ascShortcut.asc_SetKeyCode(null);
                    }

                    ascShortcut.asc_SetIsCtrl(!!e.ctrlKey);
                    ascShortcut.asc_SetIsShift(!!e.shiftKey);
                    ascShortcut.asc_SetIsAlt(!!e.altKey);
                    ascShortcut.asc_SetIsCommand(!!e.metaKey);

                    item.set('keys', keys);
                    $item.find('input').val(keys.join(' + '));
                });


                const removeKeysIfOnlyModifiers = function(removedKey) {
                    const modifierKeys = ['Ctrl', 'Shift', 'Alt', '⌘'];
                    const keys = item.get('keys');
                    const hasExtra = _.some(keys, function(k) {
                        return !_.contains(modifierKeys, k);
                    });

                    if (!hasExtra && removedKey && removedKey.length) {
                        const filteredKeys = keys.filter(function(k) {
                            return !_.contains(removedKey, k);
                        });

                        item.set('keys', filteredKeys);
                        $item.find('input').val(filteredKeys.join(' + '));
                    }
                };

                $keysInput.on('keyup', function(e) {
                    const keyMap = {
                        Control: 'Ctrl',
                        Alt: 'Alt',
                        Shift: 'Shift',
                        Meta: '⌘'
                    };
                    const mappedKey = keyMap[e.key];
                    removeKeysIfOnlyModifiers(mappedKey ? [mappedKey] : []);
                });

                $keysInput.on('focusout', function() {
                    removeKeysIfOnlyModifiers(item.get('keys', []));
                });

                $item.find('.remove-btn').on('click', function() {
                    me.shortcutsCollection.remove(item);
                    if(me.shortcutsCollection.length == 0) {
                        me.onAddShortcut();
                    }
                });
            });
            this.fixHeight(true);
        },
        
        renderShortcutsWarning: function() {
            const me = this;
            let isButtonDisabled = false;

            this.shortcutsCollection.each(function(item) {
                const ascShortcut = item.get('ascShortcut');
                const assignedActionNames = [];
                const assignedActions = me.options.findAssignedActions(ascShortcut, {
                    actionType: me.options.action.type,
                    shortcuts: me.shortcutsCollection.toJSON().slice(0, _.indexOf(me.shortcutsCollection.models, item))
                });
                const isDefaultShortcut = me.options.isDefaultShortcut(ascShortcut);
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
                        const shortcuts = me.options.getDefaultShortcuts();
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

                this.handler && this.handler.call(this, state, filteredShortcuts);
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

    },  Common.Views.ShortcutEditDialog || {}))
});