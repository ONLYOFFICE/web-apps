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
    'common/main/lib/component/ListView'
], function (contentTemplate) {
    'use strict';

    DE.Views = DE.Views || {};

    DE.Views.RolesManagerDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'RolesManagerDlg',
            contentWidth: 525,
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

            this.rolesStore = new Common.UI.DataViewStore();

            this.wrapEvents = {
                onRefreshRolesList: _.bind(this.onRefreshRolesList, this)
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.rolesList = new Common.UI.ListView({
                el: $('#name-manager-range-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                emptyText: this.textEmpty,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;<% if (!lock) { %>pointer-events:none;<% } %>">',
                    '<div class="listitem-icon toolbar__icon <% print(isTable?"btn-menu-table":(isSlicer ? "btn-slicer" : "btn-named-range")) %>"></div>',
                    '<div style="width:141px;padding-right: 5px;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<div style="width:117px;padding-right: 5px;"><%= scopeName %></div>',
                    '<div style="width:204px;"><%= range %></div>',
                    '<% if (lock) { %>',
                    '<div class="lock-user"><%=lockuser%></div>',
                    '<% } %>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.rolesList.store.comparator = function(item1, item2) {
                var n1 = item1.get(me.sort.type).toLowerCase(),
                    n2 = item2.get(me.sort.type).toLowerCase();
                if (n1==n2) return 0;
                return (n1<n2) ? -me.sort.direction : me.sort.direction;
            };
            this.rolesList.on('item:select', _.bind(this.onSelectRoleItem, this))
                .on('item:keydown', _.bind(this.onKeyDown, this))
                .on('item:dblclick', _.bind(this.onDblClickItem, this))
                .on('entervalue', _.bind(this.onDblClickItem, this));

            this.btnNewRole = new Common.UI.Button({
                el: $('#name-manager-btn-new')
            });
            this.btnNewRole.on('click', _.bind(this.onEditRole, this, false));

            this.btnEditRole = new Common.UI.Button({
                el: $('#name-manager-btn-edit')
            });
            this.btnEditRole.on('click', _.bind(this.onEditRole, this, true));

            this.btnDeleteRole = new Common.UI.Button({
                el: $('#name-manager-btn-delete')
            });
            this.btnDeleteRole.on('click', _.bind(this.onDeleteRole, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [ this.rolesList, this.btnNewRole, this.btnEditRole, this.btnDeleteRole ];
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
            this.refreshRangeList(roles);
        },

        refreshRolesList: function(roles, selectedItem) {
            if (roles) {
                this.roles = roles;
                var arr = [];
                for (var i=0; i<this.roles.length; i++) {
                    var scope = this.roles[i].asc_getScope(),
                        id = this.roles[i].asc_getIsLock(),
                        type = this.roles[i].asc_getType();
                    arr.push({
                        name: this.roles[i].asc_getName(true),
                        lock: (id!==null && id!==undefined),
                        lockuser: (id) ? (this.isUserVisible(id) ? this.getUserName(id) : this.lockText) : this.guestText,
                        type: type,
                        isTable: type===Asc.c_oAscDefNameType.table,
                        isSlicer: type===Asc.c_oAscDefNameType.slicer
                    });
                }
                this.rolesStore.reset(arr);
                this.rolesList.setEmptyText((this.rolesStore.length>0) ? this.textnoNames : this.textEmpty);
            }

            var me = this,
                store = this.rolesList.store,
                models = this.rolesStore.models,
                val = this.cmbFilter.getValue(),
                isTableFilter = (val<3) ? (val==2) : -1,
                isWorkbook = (val>2) ? (val==4) : -1;
            if (val>0)
                models = this.rolesStore.filter(function(item) {
                    if (isTableFilter!==-1)
                        return (isTableFilter===item.get('isTable'));
                    if (isWorkbook!==-1)
                        return (isWorkbook===(item.get('scope')===null));
                    return false;
                });

            store.reset(models, {silent: false});

            val = store.length;
            this.btnEditRole.setDisabled(!val);
            this.btnDeleteRole.setDisabled(!val);
            if (val>0) {
                if (selectedItem===undefined || selectedItem===null) selectedItem = 0;
                if (_.isNumber(selectedItem)) {
                    if (selectedItem>val-1) selectedItem = val-1;
                    this.rangeList.selectByIndex(selectedItem);
                    setTimeout(function() {
                        me.rangeList.scrollToRecord(store.at(selectedItem));
                    }, 50);

                } else if (selectedItem){ // object
                    var rec = store.findWhere({name: selectedItem.asc_getName(true), scope: selectedItem.asc_getScope()});
                    if (rec) {
                        this.rangeList.selectRecord(rec);
                        setTimeout(function() {
                            me.rangeList.scrollToRecord(rec);
                        }, 50);
                    }
                }

                if (this.userTooltip===true && this.rangeList.cmpEl.find('.lock-user').length>0)
                    this.rangeList.cmpEl.on('mouseover',  _.bind(me.onMouseOverLock, me)).on('mouseout',  _.bind(me.onMouseOutLock, me));
            }
            _.delay(function () {
                me.rangeList.scroller.update({alwaysVisibleY: true});
            }, 100, this);
        },

        onEditRange: function (isEdit) {
            if (this._isWarningVisible) return;

            if (this.locked) {
                Common.NotificationCenter.trigger('namedrange:locked');
                return;
            }
            var me = this,
                xy = me.$window.offset(),
                rec = this.rangeList.getSelectedRec(),
                idx = _.indexOf(this.rangeList.store.models, rec),
                oldname = (isEdit && rec) ? new Asc.asc_CDefName(rec.get('name'), rec.get('range'), rec.get('scope'), rec.get('type'), undefined, undefined, undefined, true) : null;

            var win = new SSE.Views.NamedRangeEditDlg({
                api: me.api,
                sheets  : this.sheets,
                props   : (isEdit) ? oldname : this.props,
                isEdit  : isEdit,
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        if (isEdit) {
                            me.currentNamedRange = settings;
                            me.api.asc_editDefinedNames(oldname, settings);
                        } else {
                            me.cmbFilter.setValue(0);
                            me.currentNamedRange = settings;
                            me.api.asc_setDefinedNames(settings);
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

        onDeleteRange: function () {
            var rec = this.rangeList.getSelectedRec();
            if (rec) {
                var me = this;
                me._isWarningVisible = true;
                Common.UI.warning({
                    msg: Common.Utils.String.format(me.warnDelete, rec.get('name')),
                    buttons: ['ok', 'cancel'],
                    callback: function(btn) {
                        if (btn == 'ok') {
                            me.currentNamedRange = _.indexOf(me.rangeList.store.models, rec);
                            me.api.asc_delDefinedNames(new Asc.asc_CDefName(rec.get('name'), rec.get('range'), rec.get('scope'), rec.get('type'), undefined, undefined, undefined, true));
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

            this.userTipHide();
            var rawData = {},
                isViewSelect = _.isFunction(record.toJSON);

            if (isViewSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                } else {// record deselected
                    return;
                }
                this.currentNamedRange = _.indexOf(this.rangeList.store.models, record);
                this.btnEditRange.setDisabled(rawData.lock);
                this.btnDeleteRange.setDisabled(rawData.lock || rawData.isTable || rawData.isSlicer);
            }
        },

        hide: function () {
            this.userTipHide();
            Common.UI.Window.prototype.hide.call(this);
        },

        close: function () {
            this.userTipHide();
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
        textEmpty: 'No named ranges have been created yet.<br>Create at least one named range and it will appear in this field.',
        warnDelete: 'Are you sure you want to delete the role {0}?'

    }, DE.Views.RolesManagerDlg || {}));
});