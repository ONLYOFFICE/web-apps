/*
 *
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  ProtectedRangesEditDlg.js
 *
 *  Created by Julia Radzhabova on 01.02.2023
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'common/main/lib/component/Window'
], function () {
    'use strict';

    SSE.Views.ProtectedRangesEditDlg = Common.UI.Window.extend(_.extend({

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(_options,  {
                title: options.title,
                cls: 'modal-dlg',
                width: 270,
                height: 'auto',
                buttons: ['ok', 'cancel']
            }, options);

            this.handler        = options.handler;
            this.props = options.props;
            this.names = options.names;
            this.isEdit = options.isEdit;
            this.api = options.api;

            this.template = options.template || [
                    '<div class="box">',
                        '<div class="input-row">',
                            '<label>' + t.txtRangeName + '</label>',
                        '</div>',
                        '<div id="id-protected-range-name-txt" class="input-row" style="margin-bottom: 5px;"></div>',
                        '<div class="input-row">',
                            '<label>' + t.txtRange + '</label>',
                        '</div>',
                        '<div id="id-protected-range-txt" class="input-row" style="margin-bottom: 8px;"></div>',
                        '<div class="input-row">',
                            '<label>' + t.txtWhoCanEdit + '</label>',
                        '</div>',
                        '<table cols="2">',
                        '<tr style="vertical-align: top;">',
                            '<td class="padding-small">',
                                '<div id="id-protected-range-cmb-user" class="input-group-nr" style="width:213px;margin-right: 5px;margin-bottom: 8px;"></div>',
                            '</td>',
                            '<td class="padding-small">',
                                '<div id="id-protected-range-add" style="margin-bottom: 8px;"></div>',
                            '</td>',
                        '</tr>',
                        '<tr style="vertical-align: top;">',
                            '<td class="padding-small">',
                                '<div id="id-protected-range-list-user" class="input-group-nr" style="width:213px;height: 95px;margin-right: 5px;"></div>',
                            '</td>',
                            '<td class="padding-small">',
                                '<div id="id-protected-range-delete"></div>',
                            '</td>',
                        '</tr>',
                    '</table>',
                    '</div>'
                ].join('');

            _options.tpl        =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.inputRangeName = new Common.UI.InputField({
                el: this.$window.find('#id-protected-range-name-txt'),
                allowBlank  : false,
                blankError  : this.txtEmpty,
                style       : 'width: 100%;',
                maxLength: 255,
                validateOnBlur: false,
                validateOnChange: false,
                validation  : function(value) {
                    if (value=='') return true;

                    var res = me.api.asc_checkProtectedRangeName(value);
                    switch (res) {
                        case Asc.c_oAscDefinedNameReason.WrongName:
                            return me.textInvalidName;
                            break;
                        case Asc.c_oAscDefinedNameReason.Existed:
                            return (me.isEdit && me.props.asc_getName().toLowerCase() == value.toLowerCase()) ? true : me.textExistName;
                        case Asc.c_oAscDefinedNameReason.OK:
                            var index = me.names.indexOf(value.toLowerCase());
                            return (index<0 || me.isEdit && me.props.asc_getName().toLowerCase() == value.toLowerCase()) ? true : me.textExistName;
                        default:
                            return me.textInvalidName;
                    }
                }
            });
            this.txtDataRange = new Common.UI.InputFieldBtn({
                el          : this.$window.find('#id-protected-range-txt'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : false,
                btnHint     : this.textSelectData,
                blankError  : this.txtEmpty,
                validateOnChange: true,
                validateOnBlur: false,
                validation  : function(value) {
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.ConditionalFormattingRule, value, true);
                    return (isvalid!==Asc.c_oAscError.ID.DataRangeError) ? true : me.textInvalidRange;
                }
            });
            this.txtDataRange.on('button:click', _.bind(this.onSelectData, this));

            this.cmbUser = new Common.UI.ComboBox({
                el: this.$window.find('#id-protected-range-cmb-user'),
                cls: 'input-group-nr',
                menuStyle   : 'min-width: 100%;max-height: 233px;',
                editable: true,
                data: [],
                takeFocusOnClose: true,
                itemsTemplate: _.template([
                    '<% _.each(items, function(item) { %>',
                    '<li id="<%= item.id %>" data-value="<%- item.value %>" <% if (item.hasDivider) { %> class="border-top" style="margin-top: 5px;padding-top: 5px;" <% } %>><a tabindex="-1" type="menuitem" style ="display: flex; flex-direction: column;">',
                    '<label><%= scope.getDisplayValue(item) %></label><label class="comment-text"><%= Common.Utils.String.htmlEncode(item.value) %></label></a></li>',
                    '<% }); %>'
                ].join(''))
            });
            this.cmbUser.on('selected', this.onUserSelected.bind(this));
            this.cmbUser.on('changing', this.onUserChanging.bind(this));
            this.cmbUser.on('show:before',_.bind(this.onCmbUserOpen, this));
            // this.cmbUser.on('changed:before', this.onUserChangedBefore.bind(this));

            this.listUser = new Common.UI.ListView({
                el: this.$window.find('#id-protected-range-list-user'),
                store: new Common.UI.DataViewStore(),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                    '<div style="width:90px;display: inline-block;vertical-align: middle; overflow: hidden; text-overflow: ellipsis;white-space: pre;margin-right: 5px;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<div style="width:90px;display: inline-block;vertical-align: middle; overflow: hidden; text-overflow: ellipsis;white-space: pre;"><%= Common.Utils.String.htmlEncode(email) %></div>',
                    '</div>'
                ].join('')),
                emptyText: '',
                tabindex: 1
            });
            // this.listUser.on('item:select', _.bind(this.onSelectUser, this));

            this.btnAdd = new Common.UI.Button({
                parentEl: this.$window.find('#id-protected-range-add'),
                cls: 'btn-toolbar border-off btn-options',
                iconCls: 'toolbar__icon btn-zoomup',
                hint: this.textTipAdd
            });
            // this.btnAdd.on('click', _.bind(this.onAddUser, this));

            this.btnDelete = new Common.UI.Button({
                parentEl: this.$window.find('#id-protected-range-delete'),
                cls: 'btn-toolbar border-off btn-options',
                iconCls: 'toolbar__icon cc-remove',
                hint: this.textTipDelete
            });
            // this.btnDelete.on('click', _.bind(this.onDeleteUser, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.inputRangeName, this.txtDataRange, this.cmbUser, this.btnAdd, this.listUser, this.btnDelete];
        },

        getDefaultFocusableComponent: function () {
            return this.inputRangeName;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            if (this.handler) {
                if (state == 'ok') {
                    if (this.inputRangeName && this.inputRangeName.checkValidate() !== true)  {
                        this.inputRangeName.focus();
                        return;
                    }
                    if (this.txtDataRange && this.txtDataRange.checkValidate() !== true)  {
                        this.txtDataRange.focus();
                        return;
                    }
                }
                this.handler.call(this, state, this.getSettings());
            }

            this.close();
        },

        _setDefaults: function (props) {
            if (props) {
                this.inputRangeName.setValue(props.asc_getName());
                this.txtDataRange.setValue(props.asc_getSqref());
            }
        },

        getSettings: function() {
            var props = this.props ? this.props : new Asc.CProtectedRange();
            props.asc_setName(this.inputRangeName.getValue());
            props.asc_setSqref(this.txtDataRange.getValue());
            return props;
        },

        onSelectData: function() {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        me.dataRangeValid = dlg.getSettings();
                        me.txtDataRange.setValue(me.dataRangeValid);
                        me.txtDataRange.checkValidate();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                    _.delay(function(){
                        me.txtDataRange.focus();
                    },1);
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 65, xy.top + 77);
                win.setSettings({
                    api     : me.api,
                    range   : (!_.isEmpty(me.txtDataRange.getValue()) && (me.txtDataRange.checkValidate()==true)) ? me.txtDataRange.getValue() : me.dataRangeValid,
                    type    : Asc.c_oAscSelectionDialogType.ConditionalFormattingRule,
                    validation: function() {return true;}
                });
            }
        },

        onUserSelected: function(combo, record, e) {
            var store = this.listUser.store,
                value = record.userId;
            if (value!==undefined && value!=='') {
                var rec = store.findWhere({value: value});
                if (!rec) {
                    store.add({value: value, name: record.displayValue, email: record.email});
                }
            }
        },

        onUserChanging: function(combo) {
            this.onUserMenu();
        },

        onCmbUserOpen: function(combo, record, e) {
            this.onUserMenu();
        },

        onUserMenu: function() {
            Common.UI.ExternalUsers.get(this.onUserMenuCallback.bind(this));
        },

        onUserMenuCallback: function(users) {
            var arr = [],
                str = this.cmbUser.getRawValue();

            if (users.length>0) {
                var strlc = str.toLowerCase();
                users = _.filter(users, function(item) {
                    return (item.id !== undefined && item.id !== null) &&
                            (!strlc || item.email && 0 === item.email.toLowerCase().indexOf(strlc) || item.name && 0 === item.name.toLowerCase().indexOf(strlc));
                });
                var divider = false;
                _.each(users, function(item, index) {
                    arr.push({
                        value: item.email,
                        displayValue: item.name,
                        userId: item.id,
                        hasDivider: !item.hasAccess && !divider && (index>0)
                    });
                    if (!item.hasAccess)
                        divider = true;
                });
            } else {

            }
            this.cmbUser.setData(arr);
            this.cmbUser.setRawValue(str);
            (arr.length>0) ? this.cmbUser.openMenu() : this.cmbUser.closeMenu();
        },

        txtProtect: 'Protect',
        txtRangeName: 'Title',
        txtRange: 'Range',
        txtWhoCanEdit: 'Who can edit',
        txtEmpty: 'This field is required',
        textSelectData: 'Select Data',
        textInvalidRange: 'ERROR! Invalid cells range',
        textInvalidName: 'The range title must begin with a letter and may only contain letters, numbers, and spaces.',
        textExistName: 'ERROR! Range with such a title already exists',
        textTipAdd: 'Add user',
        textTipDelete: 'Delete user'

    }, SSE.Views.ProtectedRangesEditDlg || {}));
});
