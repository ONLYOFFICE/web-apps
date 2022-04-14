/*
 *
 * (c) Copyright Ascensio System SIA 2010-2022
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *
 *  RolesManagerDlg.js
 *
 *  Created by Julia.Radzhabova on 12.04.22
 *  Copyright (c) 2022 Ascensio System SIA. All rights reserved.
 *
 */

define([  'text!documenteditor/main/app/template/RolesManagerDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ListView',
    'documenteditor/main/app/view/RoleEditDlg'
], function (contentTemplate) {
    'use strict';

    DE.Views = DE.Views || {};

    DE.Views.RolesManagerDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'RolesManagerDlg',
            contentWidth: 500,
            height: 353,
            buttons: null
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                template: [
                    '<div class="box" style="height:' + (this.options.height-85) + 'px;">',
                    '<div class="content-panel" style="padding: 0;">' + _.template(contentTemplate)({scope: this}) + '</div>',
                    '</div>',
                    '<div class="separator horizontal"></div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.closeButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.roles      = options.roles;

            this.wrapEvents = {
                onRefreshRolesList: _.bind(this.onRefreshRolesList, this)
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.rolesList = new Common.UI.ListView({
                el: $('#roles-manager-roles-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: this.textEmpty,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="">',
                    '<div class="listitem-icon toolbar__icon <%= scope.getIconCls(index) %>"></div>',
                    '<div style="min-width: 25px;text-align:center; padding-right: 5px;"><%= index+1 %></div>',
                    '<div style="min-width: 25px;">',
                        '<span class="color" style="background: <% if (color) { %>#<%= Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()) %><% } else { %> transparent <% } %>;"></span>',
                    '</div>',
                    '<div style="flex-grow: 1;padding-right: 5px;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<div style="min-width: 25px;text-align: right;opacity: 0.8;"><%= fields %></div>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.rolesList.on('item:select', _.bind(this.onSelectRoleItem, this))
                .on('item:keydown', _.bind(this.onKeyDown, this))
                .on('item:dblclick', _.bind(this.onDblClickItem, this))
                .on('entervalue', _.bind(this.onDblClickItem, this));

            this.btnNewRole = new Common.UI.Button({
                el: $('#roles-manager-btn-new', this.$window)
            });
            this.btnNewRole.on('click', _.bind(this.onEditRole, this, false));

            this.btnEditRole = new Common.UI.Button({
                el: $('#roles-manager-btn-edit', this.$window)
            });
            this.btnEditRole.on('click', _.bind(this.onEditRole, this, true));

            this.btnDeleteRole = new Common.UI.Button({
                el: $('#roles-manager-btn-delete', this.$window)
            });
            this.btnDeleteRole.on('click', _.bind(this.onDeleteRole, this));

            this.btnUp = new Common.UI.Button({
                parentEl: $('#roles-manager-btn-up', this.$window),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-up',
                hint: this.textUp
            });
            this.btnUp.on('click', _.bind(this.onMoveClick, this, true));

            this.btnDown = new Common.UI.Button({
                parentEl: $('#roles-manager-btn-down', this.$window),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-down',
                hint: this.textDown
            });
            this.btnDown.on('click', _.bind(this.onMoveClick, this, false));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [ this.btnUp, this.btnDown, this.rolesList, this.btnNewRole, this.btnEditRole, this.btnDeleteRole ];
        },

        getDefaultFocusableComponent: function () {
            return this.rolesList;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            this.refreshRolesList(this.roles, 0);
            this.api.asc_registerCallback('asc_onRefreshRolesList', this.wrapEvents.onRefreshRolesList);
        },

        onRefreshRolesList: function(roles) {
            this.refreshRolesList(roles);
        },

        refreshRolesList: function(roles, selectedItem) {
            if (roles) {
                this.roles = roles;
                var arr = [];
                for (var i=0; i<this.roles.length; i++) {
                    var role = this.roles[i];
                    arr.push({
                        name: role.name,//role.asc_getName(),
                        color: role.color,//role.asc_getColor(),
                        fields: role.fields,//role.asc_getFields(),
                        index: i,
                        scope: this
                    });
                }
                this.rolesList.store.reset(arr);
            }
            if (this.rolesList.store.length>0) {
                var me = this;
                this.rolesList.selectByIndex(0);
                setTimeout(function() {
                    me.rolesList.scrollToRecord(me.rolesList.store.at(0));
                }, 50);
            }
            this.updateButtons();
        },

        refreshRolesIndexes: function() {
            this.rolesList.store.each(function(item, index) {
                item.set('index', index);
            });
        },

        getIconCls: function(index) {
            return (index===0) ? 'btn-arrow-up' : (index===this.rolesList.store.length-1 ? 'btn-arrow-down' : 'btn-border-insidevert');
        },

        onEditRole: function (isEdit) {
            if (this._isWarningVisible) return;

            var me = this,
                xy = me.$window.offset(),
                rec = this.rolesList.getSelectedRec(),
                props = (isEdit && rec) ? {name: rec.get('name'), color: rec.get('color')} : null;

            var win = new DE.Views.RoleEditDlg({
                api: me.api,
                props   : props,
                isEdit  : isEdit,
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        var color = settings.color,
                            name = settings.name,
                            store = me.rolesList.store;
                        if (isEdit) {
                            // me.api.asc_editRole(settings);
                            rec.set('name', name);
                            rec.set('color', color);
                        } else {
                            // me.api.asc_addRole(settings);
                            rec = store.push({
                                name: name,
                                color: color,
                                fields: 0,
                                index: store.length,
                                scope: me
                            });
                            if (rec) {
                                me.rolesList.selectRecord(rec);
                                me.rolesList.scrollToRecord(rec);
                            }
                        }
                    }
                }
            }).on('close', function() {
                me.show();
                setTimeout(function(){ me.getDefaultFocusableComponent().focus(); }, 100);
            });

            me.hide();
            win.show(xy.left + 65, xy.top + 77);
            this.updateButtons();
        },

        onDeleteRole: function () {
            var rec = this.rolesList.getSelectedRec();
            if (rec) {
                var me = this,
                    store = this.rolesList.store;
                me._isWarningVisible = true;
                Common.UI.warning({
                    msg: Common.Utils.String.format(me.warnDelete, rec.get('name')),
                    buttons: ['ok', 'cancel'],
                    callback: function(btn) {
                        if (btn == 'ok') {
                            var index = store.indexOf(rec);
                            // me.api.asc_delRole(rec.get('name'));
                            store.remove(rec);
                            me.refreshRolesIndexes();
                            (store.length>0) && me.rolesList.selectByIndex(index<store.length ? index : store.length-1);
                            me.rolesList.scrollToRecord(me.rolesList.getSelectedRec());
                            me.updateButtons();
                        }
                        setTimeout(function(){ me.getDefaultFocusableComponent().focus(); }, 100);
                        me._isWarningVisible = false;
                    }
                });
            }
        },

        getSettings: function() {
            return this.sort;
        },

        onPrimary: function() {
            return true;
        },

        onDlgBtnClick: function(event) {
            this.handler && this.handler.call(this, event.currentTarget.attributes['result'].value);
            this.close();
        },

        onSelectRoleItem: function(lisvView, itemView, record) {
            if (!record) return;

            // var rawData = {},
            //     isViewSelect = _.isFunction(record.toJSON);
            //
            // if (isViewSelect){
            //     if (record.get('selected')) {
            //         rawData = record.toJSON();
            //     } else {// record deselected
            //         return;
            //     }
            // }
            this.updateMoveButtons();
        },

        onMoveClick: function(up) {
            var store = this.rolesList.store,
                length = store.length,
                rec = this.rolesList.getSelectedRec();
            if (rec) {
                var index = store.indexOf(rec);
                store.add(store.remove(rec), {at: up ? Math.max(0, index-1) : Math.min(length-1, index+1)});
                this.rolesList.selectRecord(rec);
                this.rolesList.scrollToRecord(rec);
            }
            this.refreshRolesIndexes();
            this.updateMoveButtons();
        },

        updateButtons: function() {
            this.btnEditRole.setDisabled(this.rolesList.store.length<1);
            this.btnDeleteRole.setDisabled(this.rolesList.store.length<1);
            this.updateMoveButtons();
            this.rolesList.scroller && this.rolesList.scroller.update();
        },

        updateMoveButtons: function() {
            var rec = this.rolesList.getSelectedRec(),
                index = rec ? this.rolesList.store.indexOf(rec) : -1;
            this.btnUp.setDisabled(index<1);
            this.btnDown.setDisabled(index<0 || index==this.rolesList.store.length-1);
        },

        hide: function () {
            Common.UI.Window.prototype.hide.call(this);
        },

        close: function () {
            this.api.asc_unregisterCallback('asc_onRefreshRolesList', this.wrapEvents.onRefreshRolesList);

            Common.UI.Window.prototype.close.call(this);
        },

        onKeyDown: function (lisvView, record, e) {
            if (e.keyCode==Common.UI.Keys.DELETE && !this.btnDeleteRange.isDisabled())
                this.onDeleteRange();
        },

        onDblClickItem: function (lisvView, record, e) {
            if (!this.btnEditRole.isDisabled())
                this.onEditRole(true);
        },

        txtTitle: 'Manage Roles',
        closeButtonText : 'Close',
        textNew: 'New',
        textEdit: 'Edit',
        textDelete: 'Delete',
        textEmpty: 'No roles have been created yet.<br>Create at least one role and it will appear in this field.',
        warnDelete: 'Are you sure you want to delete the role {0}?',
        textUp: 'Move role up',
        textDown: 'Move role down',
        textDescription: 'Add roles and set the order in which the fillers receive and sign the document'

    }, DE.Views.RolesManagerDlg || {}));
});