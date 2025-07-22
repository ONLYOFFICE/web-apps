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
            contentWidth: 268,
            separator: false
        },

        initialize : function(options) {
            _.extend(this.options, {
                id: 'shortcut-edit-gialog',
                title: this.txtTitle,
                contentStyle: 'padding: 16px 16px 0;',
                contentTemplate: _.template([
                    '<label id="action-label">',
                        '<span><%= scope.txtAction %>: </span>',
                        '<span id="action-label-name"><%= options.action.name %></span>',
                    '</label>',
                    '<div id="shortcuts-list"></div>',
                    '<div id="buttons-row">',
                        '<label id="new-shortcut-btn" class="link"><%= scope.txtNewShortcut %></label>',
                        '<label id="restore-btn" class="link"><%= scope.txtRestoreToDefault %></label>',
                    '</div>'
                ].join(''))({scope: this, options: options}),
            }, options);

            this.handler    = options.handler;            
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            this.newShortcutsBtn = this.$window.find('#new-shortcut-btn');
            this.newShortcutsBtn.on('click', _.bind(this.onAddShortcut, this));

            this._setDefaults();
        },

        getFocusedComponents: function() {
            return [].concat(this.getFooterButtons());
        },

        _setDefaults: function() {
            this.shortcutsCollection = new Backbone.Collection([]);
            this.shortcutsCollection.on('add remove reset', this._renderShortcutsList, this);
            this.shortcutsCollection.on('add remove reset change:keys', this._renderShortcutsWarning, this);

            this.shortcutsCollection.reset(this.options.shortcuts);
        },

        _renderShortcutsList: function(item) {
            const me = this;

            this.$window.find('#shortcuts-list').empty();
            this.shortcutsCollection.each(function(item) {
                const shortcut = item.get('shortcut');
                const isLocked = shortcut.asc_IsLocked();
                const keysStr = item.get('keys').join(' + ');
                const $item = $(
                    '<div class="item">' + 
                        '<div class="keys-input"></div>' +
                        (isLocked ? 
                        '<button type="button" class="btn-toolbar"><i class="icon toolbar__icon btn-menu-about">&nbsp;</i></button>' : 
                        '<button type="button" class="btn-toolbar remove-btn"><i class="icon toolbar__icon btn-cc-remove">&nbsp;</i></button>') +
                    '</div>'
                );
                if(me.shortcutsCollection.length == 1) {
                    $item.find('.remove-btn').attr('disabled', true).addClass('disabled');
                }
                me.$window.find('#shortcuts-list').append($item);                

                const keysInput = new Common.UI.InputField({
                    el          : $item.find('.keys-input'),
                    value       : keysStr,
                    editable    : false,
                    placeHolder : me.txtInputPlaceholder,
                    disabled    : isLocked
                });
                item.set({ keysInput: keysInput });

                $item.find('.keys-input').on('keydown', function(e) {
                    e.stopPropagation();
                    e.preventDefault();

                    const keys = [];

                    if (e.ctrlKey) keys.push('Ctrl');
                    if (e.shiftKey) keys.push('Shift');
                    if (e.altKey) keys.push('Alt');
                    if (e.metaKey) keys.push('⌘');

                    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
                        keys.push(me.options.keyCodeToKeyName(e.keyCode));
                        shortcut.asc_SetKeyCode(e.keyCode);
                    } else {
                        shortcut.asc_SetKeyCode(null);
                    }

                    shortcut.asc_SetIsCtrl(!!e.ctrlKey);
                    shortcut.asc_SetIsShift(!!e.shiftKey);
                    shortcut.asc_SetIsAlt(!!e.altKey);
                    shortcut.asc_SetIsCommand(!!e.metaKey);

                    item.set('keys', keys);
                    $item.find('input').val(keys.join(' + '));
                });

                $item.find('.remove-btn').on('click', function() {
                    me.shortcutsCollection.remove(item);
                });
            });
        },
        
        _renderShortcutsWarning: function() {
            const me = this;
            this.shortcutsCollection.each(function(item) {
                const shortcut = item.get('shortcut');
                let assignedShortcut = me.options.findAssignedShortcut(shortcut, {
                    action: me.options.action,
                    shortcuts: me.shortcutsCollection.toJSON().slice(0, _.indexOf(me.shortcutsCollection.models, item))
                });
                item.get('keysInput').showWarning(assignedShortcut ? [me.txtInputWarn.replace('{0}', assignedShortcut.action.name)] : null);
            });
        },
        
        onAddShortcut: function() {
            const lastShortcutRecord = this.shortcutsCollection.at(this.shortcutsCollection.length - 1);
            if(!lastShortcutRecord || lastShortcutRecord.get('keys').length) {
                this.shortcutsCollection.add({
                    keys: [],
                    shortcut: new Asc.CAscShortcut(this.options.action.type)
                });
            }
            this.$window.find('#shortcuts-list .item input').last().focus();
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

        txtTitle: 'Edit shortcut',
        txtAction: 'Action',
        txtInputPlaceholder: 'Type desired shortcut',
        txtInputWarn: 'The shortcut used by action “{0}” and can’t be changed',
        txtNewShortcut: 'New shortcut',
        txtRestoreToDefault: 'Restore to default',
        txtTypeDesiredShortcut: 'Type desired shortcut',
        txtShortcutUsedByAction: 'The shortcut used by action',
        txtAndCantBeChanged: 'and can’t be changed'

    },  Common.Views.ShortcutEditDialog || {}))
});