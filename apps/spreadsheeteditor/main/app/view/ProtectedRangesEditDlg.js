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
 *  ProtectedRangesEditDlg.js
 *
 *  Created on 01.02.2023
 *
 */

define([], function () {
    'use strict';

    var _CustomItem = Common.UI.DataViewItem.extend({
        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            me.template = me.options.template || me.template;

            me.listenTo(me.model, 'change:selected', function() {
                var el = me.$el || $(me.el);
                el.toggleClass('selected', me.model.get('selected') && me.model.get('allowSelected'));
                me.onSelectChange(me.model, me.model.get('selected') && me.model.get('allowSelected'));
            });
            me.listenTo(me.model, 'remove', me.remove);
        }
    });

    SSE.Views.ProtectedRangesEditDlg = Common.UI.Window.extend(_.extend({

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(_options,  {
                title: options.title,
                cls: 'modal-dlg',
                width: 300,
                height: 'auto',
                buttons: ['ok', 'cancel']
            }, options);

            this.handler        = options.handler;
            this.props = options.props;
            this.isEdit = options.isEdit;
            this.api = options.api;
            this.currentUser = options.currentUser;
            this.canRequestUsers = options.canRequestUsers;

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
                            '<label class="font-weight-bold">' + t.txtAccess + '</label>',
                        '</div>',
                        '<div id="id-protected-range-cmb-user" class="input-row input-group-nr" style="margin-bottom: 8px;"></div>',
                        '<div id="id-protected-range-list-user" class="input-group-nr no-borders" style="height: 143px;"></div>',
                    '</div>'
                ].join('');

            _options.tpl        =   _.template(this.template)(_options);

            this._userStr = '';
            this._initSettings = true;

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
                    return (me.api.asc_checkUserProtectedRangeName(value)===Asc.c_oAscDefinedNameReason.OK) ? true : me.textInvalidName;
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
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, value, true);
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
                placeHolder: this.txtYouCanEdit,
                disabled: true,
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
            this.cmbUser.on('show:after',_.bind(this.onCmbUserOpen, this));
            this.cmbUser.on('show:before',_.bind(this.onCmbUserBeforeOpen, this));
            this.cmbUser.on('hide:after',_.bind(this.onCmbUserAfterHide, this));
            // this.cmbUser.on('changed:before', this.onUserChangedBefore.bind(this));
            Common.Utils.isChrome && this.cmbUser._input && this.cmbUser._input.attr('autocomplete', '1'); // Don't show browser menu with email addresses

            this.listUser = new Common.UI.ListView({
                el: this.$window.find('#id-protected-range-list-user'),
                store: new Common.UI.DataViewStore(),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                        '<div class="color"',
                        '<% if (!!avatar) { %>',
                        'style="background-image: url(<%=avatar%>); <% if (usercolor!==null) { %> border-color:<%=usercolor%>; border-style:solid;<% }%>"',
                        '<% } else { %>',
                        'style="background-color: <% if (usercolor!==null) { %> <%=usercolor%> <% } else { %> #cfcfcf <% }%>;"',
                        '<% } %>',
                        '><% if (!avatar) { %><%-initials%><% } %></div>',
                        '<div class="" style="width:190px;display: inline-block;vertical-align: middle;">',
                            '<% if (!!email) { %>',
                                '<div class="font-weight-bold" style="overflow: hidden; text-overflow: ellipsis;white-space: pre;"><%= Common.Utils.String.htmlEncode(displayName) %></div>',
                                '<div style="overflow: hidden; text-overflow: ellipsis;white-space: pre;"><%= Common.Utils.String.htmlEncode(email) %></div>',
                            '<% } else { %>',
                                '<div class="font-weight-bold" style="overflow: hidden; text-overflow: ellipsis;white-space: pre;max-height:30px;"><%=  Common.Utils.String.htmlEncode(displayName) %></div>',
                            '<% } %>',
                        '</div>',
                        '<div class="listitem-icon"></div>',
                    '</div>'
                ].join('')),
                emptyText: '',
                tabindex: 1
            });
            this.listUser.createNewItem = function(record) {
                return new _CustomItem({
                    template: this.itemTemplate,
                    model: record
                });
            };
            this.listUser.on('item:keydown', _.bind(this.onKeyDown, this))
            this.listUser.on('item:add', _.bind(this.addControls, this));
            this.listUser.on('item:change', _.bind(this.addControls, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.inputRangeName, this.txtDataRange, this.cmbUser, this.listUser].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputRangeName;
        },

        close: function() {
            this.canRequestUsers && Common.NotificationCenter.off('mentions:setusers', this.binding.onUserMenuCallback);
            Common.UI.Window.prototype.close.apply(this, arguments);
        },

        afterRender: function() {
            if (this.canRequestUsers) {
                if (!this.binding)
                    this.binding = {};
                this.binding.onUserMenuCallback = _.bind(this.onUserMenuCallback, this);
                Common.NotificationCenter.on('mentions:setusers',   this.binding.onUserMenuCallback);
            }

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
                this.txtDataRange.setValue(props.asc_getRef());
                this.listUser.store.add({
                    value: this.currentUser.id,
                    name: this.currentUser.name,
                    displayName: this.currentUser.name + ' (' + this.textYou + ')',
                    initials: Common.Utils.getUserInitials(this.currentUser.name),
                    avatar: Common.UI.ExternalUsers.getImage(this.currentUser.id),
                    usercolor: Common.UI.ExternalUsers.getColor(this.currentUser.id),
                    email: '',
                    type: Asc.c_oSerUserProtectedRangeType.edit,
                    isCurrent: true});
                this.listUser.store.add({
                    value: null,
                    name: this.textAnyone,
                    displayName: this.textAnyone,
                    initials: Common.Utils.getUserInitials(this.textAnyone),
                    avatar: '',
                    usercolor: null,
                    email: '',
                    type: props.asc_getType() || Asc.c_oSerUserProtectedRangeType.notView,
                    isAnyone: true});
                var me = this,
                    rangeUsers = this.props.asc_getUsers();
                if (rangeUsers && rangeUsers.length>0) {
                    var store = me.listUser.store,
                        count = 1;
                    rangeUsers.forEach(function(item) {
                        var name = item.asc_getName() || me.textAnonymous;
                        (item.asc_getId()!==me.currentUser.id) && store.add({
                            value: item.asc_getId(),
                            name: name,
                            displayName: name + ' ' + count++,
                            initials: Common.Utils.getUserInitials(name),
                            avatar: Common.UI.ExternalUsers.getImage(item.asc_getId()),
                            usercolor: Common.UI.ExternalUsers.getColor(item.asc_getId()),
                            email: '',
                            type: item.asc_getType()
                        });
                    });
                }
                this.onUserMenu(true);
            }
        },

        getSettings: function() {
            var props = new Asc.CUserProtectedRange();
            props.asc_setName(this.inputRangeName.getValue());
            props.asc_setRef(this.txtDataRange.getValue());
            var arr = [];
            this.listUser.store.each(function(item){
                if (item.get('isAnyone')) {
                    props.asc_setType(item.get('type'));
                } else {
                    var user = new Asc.CUserProtectedRangeUserInfo();
                    user.asc_setId(item.get('value'));
                    user.asc_setName(item.get('name'));
                    user.asc_setType(item.get('type'));
                    arr.push(user);
                }
            });

            props.asc_setUsers(arr);
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
                    type    : Asc.c_oAscSelectionDialogType.Chart,
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
                    store.add({
                        value: value,
                        name: record.displayValue,
                        displayName: record.displayValue,
                        initials: Common.Utils.getUserInitials(record.displayValue),
                        avatar: Common.UI.ExternalUsers.getImage(value) || record.image || '',
                        usercolor: Common.UI.ExternalUsers.getColor(value),
                        email: record.value,
                        type: Asc.c_oSerUserProtectedRangeType.edit
                    });
                }
            }
            this.cmbUser.setRawValue(this._userStr);
        },

        onCmbUserAfterHide: function(combo, e, params) {
            this._forceOpen = false; // need when setUsers event initiated not from combobox
        },

        onUserChanging: function(combo, newValue) {
            if (Common.Utils.isIE && newValue==='' && this._userStr === newValue) return;
            this._userStr = newValue;
            this.onUserMenu();
        },

        onCmbUserBeforeOpen: function(combo, e, params) {
            if (combo.store.length<1) {
                e.preventDefault();
                this.onUserMenu();
            }
        },

        onCmbUserOpen: function(combo, e, params) {
            this.onUserMenu();
        },

        onUserMenu: function(preventOpen) {
            this._forceOpen = !preventOpen;
            Common.UI.ExternalUsers.get('protect');
        },

        onUserMenuCallback: function(type, users) {
            if (type!=='protect') return;

            if (this._initSettings) {
                var me = this;
                if (users && _.find(users, function(item) { return item.id!==undefined && item.id!==null; })) { // has id in user info
                    me.cmbUser.setDisabled(false);
                    me.cmbUser._input && me.cmbUser._input.attr('placeholder', me.userPlaceholder);
                }
                users && users.length>0 && this.listUser.store.each(function(item){
                    if (item.get('value')===me.currentUser.id) return;
                    var rec = _.findWhere(users, {id: item.get('value')});
                    if (rec) {
                        rec.name && item.set('name', rec.name);
                        rec.name && item.set('displayName', rec.name);
                        rec.email && item.set('email', rec.email);
                        rec.image && item.set('avatar', rec.image);
                    }
                });
                this._initSettings = false;
            }

            if (!this._forceOpen && !this.cmbUser.isMenuOpen()) return;

            var arr = [],
                str = this.cmbUser.getRawValue();

            if (users && users.length>0) {
                var strlc = str.toLowerCase();
                users = _.filter(users, function(item) {
                    return (item.id !== undefined && item.id !== null) &&
                            (!strlc || item.email && 0 === item.email.toLowerCase().indexOf(strlc) || item.name && 0 === item.name.toLowerCase().indexOf(strlc));
                });
                var divider = false;
                _.each(users, function(item, index) {
                    arr.push({
                        value: item.email || '',
                        displayValue: item.name || '',
                        userId: item.id,
                        image: item.image,
                        hasDivider: !item.hasAccess && !divider && (index>0)
                    });
                    if (item.image && !Common.UI.ExternalUsers.getImage(item.id)) {
                        Common.UI.ExternalUsers.setImage(item.id, item.image);
                    }
                    if (!item.hasAccess)
                        divider = true;
                });
            }
            this.cmbUser.setData(arr);
            this.cmbUser.setRawValue(str);

            if (arr.length>0)
                this.cmbUser.openMenu()
            else {
                this.cmbUser.closeMenu();
                this.cmbUser.focus();
            }
        },

        onKeyDown: function (lisvView, record, e) {
            if (e.keyCode===Common.UI.Keys.DELETE)
                this.onDeleteUser();
            else if (e.keyCode===Common.UI.Keys.SPACE) {
                var rec = this.listUser.getSelectedRec(),
                    btn = rec && !rec.get('isCurrent') ? rec.get('btnEdit') : null;
                btn && $('button', btn.cmpEl).click();
            }
        },

        onDeleteUser: function(rec) {
            !rec && (rec = this.listUser.getSelectedRec());
            if (rec && !rec.get('isCurrent') && !rec.get('isAnyone')) {
                this.listUser.store.remove(rec);
            }
            var me = this;
            setTimeout(function() {
                me.listUser.focus();
            }, 1);
        },

        addControls: function(listView, itemView, item) {
            if (!item) return;

            var me = this,
                type = item.get('type');
            var btn = new Common.UI.Button({
                parentEl: $('.listitem-icon', $(itemView.el)),
                cls: 'btn-toolbar',
                iconCls: 'toolbar__icon ' + (type===Asc.c_oSerUserProtectedRangeType.edit ? 'btn-edit' : type===Asc.c_oSerUserProtectedRangeType.view ? 'btn-sheet-view' : 'btn-hide-password'),
                disabled: !!item.get('isCurrent'),
                menu: item.get('isCurrent') ? false : new Common.UI.Menu({
                    style: 'min-width: auto;',
                    additionalAlign: this.menuAddAlign,
                    items: item.get('isAnyone') ? [
                        {
                            caption: this.textCanView,
                            value: 'view',
                            iconCls: 'menu__icon btn-sheet-view',
                        },
                        {
                            caption: this.textCantView,
                            value: 'notview',
                            iconCls: 'menu__icon btn-hide-password'
                        }
                    ] : [
                        {
                            caption: this.textCanEdit,
                            value: 'edit',
                            iconCls: 'menu__icon btn-edit',
                        },
                        {
                            caption: this.textCanView,
                            value: 'view',
                            iconCls: 'menu__icon btn-sheet-view',
                        },
                        { caption: '--'},
                        {
                            caption: this.textRemove,
                            value: 'remove',
                            iconCls: 'menu__icon btn-cc-remove'
                        },
                    ]
                })
            });
            if (btn.menu) {
                btn.menu.on('item:click', function(menu, mni) {
                    if (mni.value==='remove') {
                        me.onHideMenu();
                        me.onDeleteUser(item);
                    } else {
                        item.set('type', mni.value==='edit' ? Asc.c_oSerUserProtectedRangeType.edit : mni.value==='view' ? Asc.c_oSerUserProtectedRangeType.view : Asc.c_oSerUserProtectedRangeType.notView);
                        item.get('btnEdit').setIconCls('toolbar__icon ' + (mni.value==='edit' ? 'btn-edit' : mni.value==='view' ? 'btn-sheet-view' : 'btn-hide-password'));
                    }
                });
                btn.menu.on('show:after', _.bind(this.onShowMenu, this));
                btn.menu.on('hide:after', _.bind(this.onHideMenu, this));
            }
            item.set('btnEdit', btn, {silent: true});
        },

        onShowMenu: function() {
            this.listUser.enableKeyEvents = false;
        },

        onHideMenu: function() {
            this.listUser.enableKeyEvents = true;
            var me = this;
            setTimeout(function() {
                me.listUser.focus();
            }, 1);
        },

        txtProtect: 'Protect',
        txtRangeName: 'Title',
        txtRange: 'Range',
        txtEmpty: 'This field is required',
        textSelectData: 'Select Data',
        textInvalidRange: 'ERROR! Invalid cells range',
        textInvalidName: 'The range title must begin with a letter and may only contain letters, numbers, and spaces.',
        textYou: 'you',
        userPlaceholder: 'Start type name or email',
        txtYouCanEdit: 'Only you can edit this range',
        textAnonymous: 'Anonymous',
        textCanEdit: 'Edit',
        textCanView: 'View',
        textRemove: 'Remove',
        textCantView: 'Denied',
        textAnyone: 'Anyone',
        txtAccess: 'Access to range'

    }, SSE.Views.ProtectedRangesEditDlg || {}));
});
