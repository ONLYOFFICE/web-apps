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
    'common/main/lib/view/AdvancedSettingsWindow'
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
                        '<b><%= scope.txtDescription %>: </b>',
                        '<span id="action-description-text"></span>',
                    '</div>'
                ].join(''))({scope: this}),
                buttons: []
            }, options);

            this.handler    = options.handler;
            this.api = options.api;

            this._state     = {
                searchValue: ''
            };

            const app = (window.DE || window.PE || window.SSE || window.PDFE || window.VE);
            this._shortcutsController = app.getController('Common.Controllers.Shortcuts'); 

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
                                '<div class="action-keys-item">',
                                    '<% _.each(shortcut.keys, function(key, keyIndex) { %>',
                                        '<% if (keyIndex != 0) { %>',
                                            '<div class="action-keys-item-plus">+</div>',
                                        '<% } %>',
                                        '<div class="action-keys-item-key"><%= key %></div>',
                                    '<% }); %>',
                                    '<div class="action-keys-item-comma">,</div>',
                                '</div>',
                            '<% }); %>',
                        '</div>',
                        '<% if (action.isLocked) { %>',
                            '<i class="icon toolbar__icon btn-lock icon-lock">&nbsp;</i>',
                        '<% } else { %>',
                            '<button type="button" class="action-edit btn-toolbar">',
                                '<i class="icon toolbar__icon btn-edit">&nbsp;</i>',
                            '</button>',
                        '<% } %>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.actionsList.on('item:select', _.bind(this.onSelectActionItem, this));
            this.actionsList.on('item:click', _.bind(this.onClickActionItem, this));
            this.actionsList.on('item:dblclick', _.bind(this.onEditActionItem, this));
            this.actionsList.on('entervalue', _.bind(function(list, record) {
                this.onEditActionItem(list, null, record);
            }, this));

            this.searchInput = this.$window.find('#search-input');
            this.searchInput.on('input', _.bind(this.onInputSearch, this));


            this.resetAllBtn = new Common.UI.Button({
                el: this.$window.find('#reset-all-btn')
            });
            this.resetAllBtn.on('click', _.bind(this.onResetAll, this));

            Common.NotificationCenter.on('shortcuts:update', _.bind(function() {
                this._setDefaults();
                this.shortcutsEditDialog && this.shortcutsEditDialog.renderShortcutsWarning();
            }, this));
            this._setDefaults();
        },

        getFocusedComponents: function() {
            return [this.searchInput, this.resetAllBtn, this.actionsList];
        },

        getDefaultFocusableComponent: function () {
            return this.actionsList;
        },

        _setDefaults: function() {
            this._updateActionsList();
        },

        _getActionsMap: function() {
            return this._shortcutsController.getActionsMap();
        },

        _updateActionsList: function() {
            const selectedActionIndex = this.actionsList.store.findIndex(function(item) { 
                return item.get('selected');
            });
            const scrollPos = this.actionsList.scroller.getScrollTop();

            if(this._state.searchValue) {
                this._filterActionsList();
            } else {
                this.actionsList.store.reset(_.values(this._getActionsMap()));
            }

            this.actionsList.scroller.scrollTop(scrollPos);
            if(selectedActionIndex != -1) {
                this.actionsList.selectByIndex(selectedActionIndex);
            }
        },

        _filterActionsList: function() {
            let filteredData;
            const me = this;
            const actionsData = _.values(this._getActionsMap());
            if(me._state.searchValue) {
                filteredData = actionsData.filter(function(item) {
                    return (item.action.name || '').toLowerCase().includes(me._state.searchValue);
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

            this.shortcutsEditDialog = new Common.Views.ShortcutsEditDialog({
                action: record.get('action')
            });
            this.shortcutsEditDialog.show();
            this.shortcutsEditDialog.on('close', function() {
                me.shortcutsEditDialog = null;
                me.actionsList.focus();
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
                        me._shortcutsController.resetAllShortcuts();
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
        txtDescription: 'Description',
        txtEmpty: 'No matches found. Adjust your search.',
        txtSearch: 'Search',
        txtRestoreAll: 'Restore All to Defaults',
        txtRestoreToDefault: 'Restore to default',
        txtRestoreDescription: 'All shortcuts settings will be restored to deafult.',
        txtRestoreContinue: 'Do you want to continue?'
    
    },  Common.Views.ShortcutsDialog || {}))
});