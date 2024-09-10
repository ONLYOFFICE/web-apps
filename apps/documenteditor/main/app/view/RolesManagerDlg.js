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
 *
 *  RolesManagerDlg.js
 *
 *  Created on 12.04.22
 *
 */

define([
    'text!documenteditor/main/app/template/RolesManagerDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    DE.Views = DE.Views || {};

    DE.Views.RolesManagerDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'RolesManagerDlg',
            contentWidth: 500,
            separator: false,
            buttons: ['close']
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                contentStyle: 'padding: 0;',
                contentTemplate: _.template(contentTemplate)({scope: this})
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;
            this.oformManager = this.api.asc_GetOForm();

            this.wrapEvents = {
                onRefreshRolesList: _.bind(this.onRefreshRolesList, this)
            };
            this.arrColors = [];

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
                    '<div class="listitem-icon" style="flex-shrink: 0;"><svg class=""><use xlink:href="#svg-icon-<%= scope.getIconCls(index) %>"></use></svg></div>',
                    '<div class="padding-right-5" style="width: 25px;text-align:center;flex-shrink: 0;"><%= index+1 %></div>',
                    '<div style="width: 25px;flex-shrink: 0;">',
                        '<span class="color" style="background: <% if (color) { %>#<%= color %><% } else { %> transparent <% } %>;"></span>',
                    '</div>',
                    '<div class="padding-right-5" style="flex-grow: 1;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<div class="text-align-right" style="width: 25px;opacity: 0.8;flex-shrink: 0;"><%= fields %></div>',
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
                scaling: false,
                hint: this.textUp
            });
            this.btnUp.on('click', _.bind(this.onMoveClick, this, true));

            this.btnDown = new Common.UI.Button({
                parentEl: $('#roles-manager-btn-down', this.$window),
                cls: 'btn-toolbar bg-white',
                iconCls: 'caret-down',
                scaling: false,
                hint: this.textDown
            });
            this.btnDown.on('click', _.bind(this.onMoveClick, this, false));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [ this.btnUp, this.btnDown, this.btnNewRole, this.btnEditRole, this.btnDeleteRole, this.rolesList].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.rolesList;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            this.refreshRolesList(this.oformManager.asc_getAllRoles(), 0);
            this.api.asc_registerCallback('asc_onUpdateOFormRoles', this.wrapEvents.onRefreshRolesList);
        },

        onRefreshRolesList: function(roles) {
            this.refreshRolesList(roles);
        },

        refreshRolesList: function(roles, selectedRole) {
            (selectedRole===undefined) && (selectedRole = this.lastSelectedRole); // when add or delete roles
            this.lastSelectedRole = undefined;
            if (selectedRole===undefined && this.rolesList.store.length>0) {
                var rec = this.rolesList.getSelectedRec();
                rec && (selectedRole = rec.get('name'));
            }
            this.arrColors = [];
            if (roles) {
                var arr = [];
                for (var i=0; i<roles.length; i++) {
                    var role = roles[i].asc_getSettings(),
                        color = role.asc_getColor();
                    color && (color = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()));
                    arr.push({
                        name: role.asc_getName() || this.textAnyone,
                        color: color,
                        fields: role.asc_getFieldCount() || 0,
                        index: i,
                        scope: this
                    });
                    color && this.arrColors.push(color.toUpperCase());
                }
                this.rolesList.store.reset(arr);
            }
            if (this.rolesList.store.length>0) {
                var me = this,
                    rec;
                (selectedRole===undefined) && (selectedRole = 0);
                if (typeof selectedRole === 'string') { // name
                    rec = this.rolesList.store.findWhere({name: selectedRole});
                    this.rolesList.selectRecord(rec);
                } else {
                    selectedRole = Math.min(selectedRole, this.rolesList.store.length-1);
                    rec = this.rolesList.selectByIndex(selectedRole);
                }
                setTimeout(function() {
                    me.rolesList.scrollToRecord(rec || me.rolesList.store.at(0));
                }, 50);
            }
            this.updateButtons();
        },

        getIconCls: function(index) {
            if (this.rolesList.store.length===1)
                return 'Point';
            return (index===0) ? 'StartPoint' : (index===this.rolesList.store.length-1 ? 'EndPoint' : 'MiddlePoint');
        },

        onEditRole: function (isEdit) {
            if (this._isWarningVisible) return;

            var me = this,
                xy = me.$window.offset(),
                rec = this.rolesList.getSelectedRec();

            var win = new DE.Views.RoleEditDlg({
                oformManager: me.oformManager,
                props   : (isEdit && rec) ? {name: rec.get('name'), color: rec.get('color')} : null,
                colors  : me.arrColors,
                isEdit  : (isEdit && rec),
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        me.lastSelectedRole = settings.name;

                        var role = new AscCommon.CRoleSettings();
                        role.asc_putName(settings.name);
                        role.asc_putColor(settings.color);
                        if (isEdit && rec) {
                            me.oformManager.asc_editRole(rec.get('name'), role);
                        } else {
                            me.oformManager.asc_addRole(role);
                        }
                    }
                }
            }).on('close', function() {
                me.show();
                setTimeout(function(){ me.getDefaultFocusableComponent().focus(); }, 100);
            });

            me.hide();
            win.show(xy.left + 65, xy.top + 77);
        },

        onDeleteRole: function () {
            var me = this,
                store = this.rolesList.store,
                rec = this.rolesList.getSelectedRec();

            if (!rec) return;

            var callback = function(toRole) {
                me.lastSelectedRole = store.indexOf(rec);
                me.oformManager.asc_removeRole(rec.get('name'), toRole); // remove role and move it's fields
            };

            if (store.length===1 || rec.get('fields')<1) {
                me._isWarningVisible = true;
                Common.UI.warning({
                    msg: Common.Utils.String.format(store.length===1 ? me.textDeleteLast : me.warnDelete, Common.Utils.String.htmlEncode(rec.get('name'))),
                    maxwidth: 600,
                    buttons: ['ok', 'cancel'],
                    callback: function(btn) {
                        if (btn == 'ok') {
                            callback();
                        }
                        setTimeout(function(){ me.getDefaultFocusableComponent().focus(); }, 100);
                        me._isWarningVisible = false;
                    }
                });
            } else {
                var xy = me.$window.offset();
                var win = new DE.Views.RoleDeleteDlg({
                    props   : {roles: this.rolesList.store, excludeName: rec.get('name')},
                    handler : function(result, settings) {
                        if (result == 'ok' && settings) {
                            callback(settings);
                        }
                    }
                }).on('close', function() {
                    me.show();
                    setTimeout(function(){ me.getDefaultFocusableComponent().focus(); }, 100);
                });

                me.hide();
                win.show(xy.left + 65, xy.top + 77);
            }
        },

        getSettings: function() {
        },

        onPrimary: function() {
            return true;
        },

        onDlgBtnClick: function(event) {
            this.handler && this.handler.call(this, event.currentTarget.attributes['result'].value, this.getSettings());
            this.close();
        },

        onSelectRoleItem: function(lisvView, itemView, record) {
            if (!record) return;
            this.lastSelectedRole = undefined;
            this.updateMoveButtons();
        },

        onMoveClick: function(up) {
            var rec = this.rolesList.getSelectedRec();
            if (rec) {
                this.lastSelectedRole = rec.get('name');
                up ? this.oformManager.asc_moveUpRole(rec.get('name')) : this.oformManager.asc_moveDownRole(rec.get('name'));
            }
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
            this.api.asc_unregisterCallback('asc_onUpdateOFormRoles', this.wrapEvents.onRefreshRolesList);

            Common.UI.Window.prototype.close.call(this);
        },

        onKeyDown: function (lisvView, record, e) {
            if (e.keyCode==Common.UI.Keys.DELETE && !this.btnDeleteRole.isDisabled())
                this.onDeleteRole();
        },

        onDblClickItem: function (lisvView, record, e) {
            if (!this.btnEditRole.isDisabled())
                this.onEditRole(true);
        },

        txtTitle: 'Manage Roles',
        textNew: 'New',
        textEdit: 'Edit',
        textDelete: 'Delete',
        textEmpty: 'No roles have been created yet.<br>Create at least one role and it will appear in this field.',
        warnDelete: 'Are you sure you want to delete the role {0}?',
        warnCantDelete: 'You cannot delete this role because it has associated fields.',
        textUp: 'Move role up',
        textDown: 'Move role down',
        textDescription: 'Add roles and set the order in which the fillers receive and sign the document',
        textAnyone: 'Anyone',
        textDeleteLast: 'Are you sure you want to delete the role {0}?<br>Once deleted, the default role will be created.'

    }, DE.Views.RolesManagerDlg || {}));
});