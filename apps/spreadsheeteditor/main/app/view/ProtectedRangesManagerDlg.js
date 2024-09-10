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
 *  ProtectedRangesManagerDlg.js
 *
 *  Created on 01.02.23
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/ProtectedRangesManagerDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.ProtectedRangesManagerDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'ProtectedRangesManagerDlg',
            contentWidth: 490,
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
            this.locked     = options.locked || false;
            this.userTooltip = true;
            this.currentRange = 0;
            this.currentUser = options.currentUser;
            this.canRequestUsers = options.canRequestUsers;

            this.wrapEvents = {
                onRefreshUserProtectedRangesList: _.bind(this.onRefreshUserProtectedRangesList, this),
                onLockUserProtectedManager: _.bind(this.onLockUserProtectedManager, this),
                onApiSheetChanged: _.bind(this.onApiSheetChanged, this)
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.cmbFilter = new Common.UI.ComboBox({
                el          : $('#protect-edit-ranges-combo-filter'),
                menuStyle   : 'min-width: 100%;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [],
                takeFocusOnClose: true
            }).on('selected', function(combo, record) {
                me.refreshRangeList(0);
            });

            this.rangeList = new Common.UI.ListView({
                el: $('#protect-edit-ranges-list', this.$window),
                store: new Common.UI.DataViewStore(),
                multiSelect: true,
                simpleAddMode: true,
                emptyText: this.textEmpty,
                headers: [
                    {name: this.textTitle,  width: 184},
                    {name: this.textRange,  width: 191},
                    {name: this.txtAccess, width: 70},
                ],
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;<% if (!lock) { %>pointer-events:none;<% } %>">',
                    '<div class="padding-right-5" style="width:184px;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<div class="padding-right-5" style="width:191px;"><%= Common.Utils.String.htmlEncode(range) %></div>',
                    '<div style="width:70px;"><% if (type===Asc.c_oSerUserProtectedRangeType.edit) { %>', me.txtEdit, '<% } else if (type===Asc.c_oSerUserProtectedRangeType.view) { %>', me.txtView, '<% } else { %>', me.txtDenied, '<% } %></div>',
                    '<% if (lock) { %>',
                    '<div class="lock-user"><%=Common.Utils.String.htmlEncode(lockuser)%></div>',
                    '<% } %>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            // this.rangeList.store.comparator = function(item1, item2) {
            //     var n1 = item1.get('name').toLowerCase(),
            //         n2 = item2.get('name').toLowerCase();
            //     if (n1==n2) return 0;
            //     return (n1<n2) ? -1 : 1;
            // };
            this.rangeList.on('item:select', _.bind(this.onSelectRangeItem, this))
                .on('item:deselect', _.bind(this.onDeselectRangeItem, this))
                .on('item:keydown', _.bind(this.onKeyDown, this))
                .on('item:dblclick', _.bind(this.onDblClickItem, this))
                .on('entervalue', _.bind(this.onDblClickItem, this));

            this.btnNewRange = new Common.UI.Button({
                el: $('#protect-edit-ranges-btn-new')
            });
            this.btnNewRange.on('click', _.bind(this.onEditRange, this, false));

            this.btnEditRange = new Common.UI.Button({
                el: $('#protect-edit-ranges-btn-edit')
            });
            this.btnEditRange.on('click', _.bind(this.onEditRange, this, true));

            this.btnDeleteRange = new Common.UI.Button({
                el: $('#protect-edit-ranges-btn-delete')
            });
            this.btnDeleteRange.on('click', _.bind(this.onDeleteRange, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [ this.cmbFilter, this.btnNewRange, this.btnEditRange, this.btnDeleteRange, this.rangeList].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.rangeList;
        },

        afterRender: function() {
            this._setDefaults();
        },

        _setDefaults: function () {
            this.onApiSheetChanged();
            this.api.asc_registerCallback('asc_onRefreshUserProtectedRangesList', this.wrapEvents.onRefreshUserProtectedRangesList);
            this.api.asc_registerCallback('asc_onLockUserProtectedManager', this.wrapEvents.onLockUserProtectedManager);
            this.api.asc_registerCallback('asc_onSheetsChanged',            this.wrapEvents.onApiSheetChanged);
        },

        refreshRangeList: function(selectedItem) {
            var sheetIndex = this.cmbFilter.getValue();
            var ranges = this.api.asc_getUserProtectedRanges(sheetIndex>=0 ? this.api.asc_getWorksheetName(sheetIndex) : undefined);
            if (ranges) {
                var arr = [],
                    currentId = this.currentUser.id;
                for (var i=0; i<ranges.length; i++) {
                    var id = ranges[i].asc_getIsLock(),
                        users = ranges[i].asc_getUsers(),
                        type = ranges[i].asc_getType(),
                        user = _.find(users, function(item) { return (item.asc_getId()===currentId); })
                    user && (type = user.asc_getType());
                    arr.push({
                        name: ranges[i].asc_getName() || '',
                        range: ranges[i].asc_getRef() || '',
                        rangeId: ranges[i].asc_getId() || '',
                        users: users,
                        props: ranges[i],
                        type: type,
                        canEdit: type===Asc.c_oSerUserProtectedRangeType.edit,
                        lock: (id!==null && id!==undefined),
                        lockuser: (id) ? (this.isUserVisible(id) ? this.getUserName(id) : this.lockText) : this.guestText
                    });
                }
                this.rangeList.store.reset(arr);
            }

            var me = this,
                store = this.rangeList.store,
                val = store.length;
            if (val>0) {
                if (selectedItem===undefined || selectedItem===null) selectedItem = 0;
                if (_.isNumber(selectedItem)) {
                    if (selectedItem>val-1) selectedItem = val-1;
                    this.rangeList.selectByIndex(selectedItem);
                    setTimeout(function() {
                        me.rangeList.scrollToRecord(store.at(selectedItem));
                    }, 50);

                } else if (selectedItem){ // object
                    var rec = store.findWhere({rangeId: selectedItem.asc_getId()});
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
            this.updateButtons();
            _.delay(function () {
                me.rangeList.scroller.update({alwaysVisibleY: true});
            }, 100, this);
        },

        onMouseOverLock: function (evt, el, opt) {
            if (this.userTooltip===true && $(evt.target).hasClass('lock-user')) {
                var me = this,
                    tipdata = $(evt.target).tooltip({title: this.tipIsLocked,trigger:'manual'}).data('bs.tooltip');

                this.userTooltip = tipdata.tip();
                this.userTooltip.css('z-index', parseInt(this.$window.css('z-index')) + 10);
                tipdata.show();

                setTimeout(function() { me.userTipHide(); }, 5000);
            }
        },

        userTipHide: function () {
            if (typeof this.userTooltip == 'object') {
                this.userTooltip.remove();
                this.userTooltip = undefined;
                this.rangeList.cmpEl.off('mouseover').off('mouseout');
            }
        },

        onMouseOutLock: function (evt, el, opt) {
            if (typeof this.userTooltip == 'object') this.userTipHide();
        },

        onEditRange: function (isEdit) {
            if (this._isWarningVisible) return;

            if (this.locked) {
                Common.NotificationCenter.trigger('protectedrange:locked');
                return;
            }
            var me = this,
                xy = me.$window.offset(),
                rec = this.rangeList.getSelectedRec(),
                props;
            if (isEdit) {
                if (!rec || rec.length!==1) return;
                props = rec[0].get('props');
            } else {
                props = new Asc.CUserProtectedRange();
                props.asc_setRef(me.api.asc_getActiveRangeStr(Asc.referenceType.A));
            }

            var win = new SSE.Views.ProtectedRangesEditDlg({
                title   : isEdit ? me.txtEditRange : me.txtNewRange,
                props   : props,
                isEdit  : isEdit,
                api     : me.api,
                canRequestUsers: me.canRequestUsers,
                currentUser: {id: me.currentUser.id, name: me.getUserName(me.currentUser.id, true)},
                handler : function(result, newprops) {
                    if (result == 'ok') {
                        me.currentRange = newprops;
                        if (isEdit) {
                            me.api.asc_changeUserProtectedRange(props, newprops);
                        } else {
                            me.api.asc_addUserProtectedRange(newprops);
                        }
                    }
                }
            }).on('close', function() {
                me.show();
                setTimeout(function(){ me.getDefaultFocusableComponent().focus(); }, 100);
            });

            me.hide();
            win.show(xy.left + 65, xy.top);
        },

        onDeleteRange: function () {
            var rec = this.rangeList.getSelectedRec();
            if (rec && rec.length>0) {
                var me = this;
                me._isWarningVisible = true;
                Common.UI.warning({
                    msg: rec.length>1 ? me.warnDeleteRanges : Common.Utils.String.format(me.warnDelete, rec[0].get('name')),
                    maxwidth: 500,
                    buttons: ['ok', 'cancel'],
                    callback: function(btn) {
                        if (btn == 'ok') {
                            me.currentRange = _.indexOf(me.rangeList.store.models, rec[rec.length-1]) - rec.length + 1;
                            me.api.asc_deleteUserProtectedRange(_.map(rec, function(item) {
                                return item.get('props')
                            }));
                        }
                        setTimeout(function(){ me.getDefaultFocusableComponent().focus(); }, 100);
                        me._isWarningVisible = false;
                    }
                });
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

        getUserName: function(id, original){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = original ? usersStore.findOriginalUser(id) : usersStore.findUser(id);
                if (rec)
                    return AscCommon.UserInfoParser.getParsedName(rec.get('username'));
            }
            return this.guestText;
        },

        isUserVisible: function(id){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return !rec.get('hidden');
            }
            return true;
        },

        onSelectRangeItem: function(listView, itemView, record) {
            if (!record) return;

            this.userTipHide();
            var rawData = {},
                isViewSelect = _.isFunction(record.toJSON);

            if (isViewSelect){
                if (record.get('selected')) {
                    rawData = record.toJSON();
                    this.currentRange = _.indexOf(this.rangeList.store.models, record);
                } else {// record deselected
                    return;
                }
            }
            this.updateButtons();
        },

        onDeselectRangeItem: function(listView, itemView, record) {
            this.userTipHide();
            this.updateButtons();
        },

        hide: function () {
            this.userTipHide();
            Common.UI.Window.prototype.hide.call(this);
        },

        close: function () {
            this.userTipHide();
            this.api.asc_unregisterCallback('asc_onRefreshUserProtectedRangesList', this.wrapEvents.onRefreshUserProtectedRangesList);
            this.api.asc_unregisterCallback('asc_onLockUserProtectedManager', this.wrapEvents.onLockUserProtectedManager);
            this.api.asc_unregisterCallback('asc_onSheetsChanged',            this.wrapEvents.onApiSheetChanged);
            Common.UI.Window.prototype.close.call(this);
        },

        onKeyDown: function (lisvView, record, e) {
            if (e.keyCode==Common.UI.Keys.DELETE && !this.btnDeleteRange.isDisabled())
                this.onDeleteRange();
        },

        onDblClickItem: function (lisvView, record, e) {
            if (!this.btnEditRange.isDisabled())
                this.onEditRange(true);
        },

        onRefreshUserProtectedRangesList: function() {
            this.refreshRangeList(this.currentRange);
        },

        onLockUserProtectedManager: function(lock) {
            this.locked = !!lock;
            this.updateButtons();
            if (this.locked && this.userTooltip===true && this.rangeList.cmpEl.find('.lock-user').length>0)
                this.rangeList.cmpEl.on('mouseover',  _.bind(this.onMouseOverLock, this)).on('mouseout',  _.bind(this.onMouseOutLock, this));
        },

        updateButtons: function() {
            var rec = this.rangeList.getSelectedRec(),
                lock = rec && rec.length>0 ? _.find(rec, function(item) { return !!item.get('lock'); }) : true,
                length = this.rangeList.store.length,
                canEdit = rec && rec.length>0 ? !_.find(rec, function(item) { return !item.get('canEdit'); }) : false;
            this.btnDeleteRange.setDisabled(length<1 || lock || !canEdit || !!this.currentUser.anonymous);
            this.btnEditRange.setDisabled(length<1 || !(rec && rec.length===1) || lock || !canEdit || !!this.currentUser.anonymous);
            this.btnNewRange.setDisabled(!!this.currentUser.anonymous);
        },

        onApiSheetChanged: function() {
            var oldValue = this.cmbFilter.store.length>0 ? this.cmbFilter.getValue() : this.api.asc_getActiveWorksheetIndex();
            var wc = this.api.asc_getWorksheetsCount(),
                i = -1,
                items = [];
            while (++i < wc) {
                if (!this.api.asc_isWorksheetHidden(i)) {
                    items.push({displayValue: this.api.asc_getWorksheetName(i), value: i});
                }
            }
            this.cmbFilter.setData([{value: -1, displayValue: this.textFilterAll}].concat(items));
            this.cmbFilter.setValue(oldValue, -1);
            this.refreshRangeList(this.cmbFilter.getValue()!==oldValue ? 0 : this.currentRange);
        },

        txtTitle: 'Protected Ranges',
        textRangesDesc: 'You can restrict editing or viewing ranges to selected people.',
        textTitle: 'Title',
        textRange: 'Range',
        textNew: 'New',
        textEdit: 'Edit',
        textDelete: 'Delete',
        textEmpty: 'No protected ranges have been created yet.<br>Create at least one protected range and it will appear in this field.',
        guestText: 'Guest',
        tipIsLocked: 'This element is being edited by another user.',
        warnDelete: 'Are you sure you want to delete the protected range {0}?<br>Anyone who has edit access to the spreadsheet will be able to edit content in the range.',
        warnDeleteRanges: 'Are you sure you want to delete the protected ranges?<br>Anyone who has edit access to the spreadsheet will be able to edit content in those ranges.',
        textProtect: 'Protect Sheet',
        txtEdit: 'Edit',
        txtView: 'View',
        txtEditRange: 'Edit Range',
        txtNewRange: 'New Range',
        lockText: 'Locked',
        textFilter: 'Filter',
        textFilterAll: 'All',
        txtDenied: 'Denied',
        txtAccess: 'Access'

    }, SSE.Views.ProtectedRangesManagerDlg || {}));
});