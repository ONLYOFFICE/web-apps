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
 *
 *  ProtectedRangesManagerDlg.js
 *
 *  Created by Julia.Radzhabova on 01.02.23
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */

define([  'text!spreadsheeteditor/main/app/template/ProtectedRangesManagerDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ListView'
], function (contentTemplate) {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.ProtectedRangesManagerDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'ProtectedRangesManagerDlg',
            contentWidth: 480,
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
            this.locked     = options.locked || false;
            this.userTooltip = true;
            this.currentRange = undefined;
            this.sheets     = options.sheets || [];
            this.sheetNames = options.sheetNames || [];
            this.currentUserId = options.currentUserId;
            this.deletedArr = [];

            this.wrapEvents = {
                onRefreshUserProtectedRangesList: _.bind(this.onRefreshUserProtectedRangesList, this)
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
                me.refreshRangeList(null, 0);
            });

            this.rangeList = new Common.UI.ListView({
                el: $('#protect-edit-ranges-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                emptyText: this.textEmpty,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;<% if (!lock) { %>pointer-events:none;<% } %>">',
                    '<div style="width:184px;padding-right: 5px;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '<div style="width:191px;padding-right: 5px;"><%= range %></div>',
                    '<div style="width:70px;"><% if (canEdit) { %>', me.txtEdit, '<% } else { %>', me.txtView, '<% } %></div>',
                    '<% if (lock) { %>',
                    '<div class="lock-user"><%=lockuser%></div>',
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
            return [ this.cmbFilter, this.rangeList, this.btnNewRange, this.btnEditRange, this.btnDeleteRange ];
        },

        getDefaultFocusableComponent: function () {
            return this.rangeList;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            this.currentSheet = this.api.asc_getActiveWorksheetIndex();

            this.cmbFilter.setData([{value: undefined, displayValue: this.textFilterAll}].concat(this.sheets));
            this.cmbFilter.setValue(this.currentSheet);

            this.refreshRangeList(props, 0);
            this.api.asc_registerCallback('asc_onRefreshUserProtectedRangesList', this.wrapEvents.onRefreshUserProtectedRangesList);
        },

        refreshRangeList: function(ranges, selectedItem) {
            if (!ranges)
                ranges = this.api.asc_getUserProtectedRanges(this.api.asc_getWorksheetName(this.cmbFilter.getValue()));
            if (ranges) {
                var arr = [];
                for (var i=0; i<ranges.length; i++) {
                    var id = ranges[i].asc_getIsLock(),
                        users = ranges[i].asc_getUsers();
                    arr.push({
                        name: ranges[i].asc_getName() || '',
                        range: ranges[i].asc_getRef() || '',
                        users: users,
                        props: ranges[i],
                        canEdit: _.indexOf(users, this.currentUserId)>=0,
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
                    var rec = store.findWhere({name: selectedItem.asc_getName(true)});
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
            if (this.locked) {
                Common.NotificationCenter.trigger('namedrange:locked');
                return;
            }
            var me = this,
                xy = me.$window.offset(),
                rec = this.rangeList.getSelectedRec(),
                props;
            if (isEdit)
                props = rec.get('props');
            else {
                props = new Asc.CUserProtectedRange();
                props.asc_setRef(me.api.asc_getActiveRangeStr(Asc.referenceType.A));
            }
            var names = [];
            this.rangeList.store.each(function(item){
                names.push(item.get('name').toLowerCase());
            });

            var win = new SSE.Views.ProtectedRangesEditDlg({
                title   : isEdit ? me.txtEditRange : me.txtNewRange,
                props   : props,
                names   : names,
                isEdit  : isEdit,
                api     : me.api,
                currentUser: {id: me.currentUserId, name: me.getUserName(me.currentUserId, true)},
                handler : function(result, newprops) {
                    if (result == 'ok') {
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
            var store = this.rangeList.store,
                rec = this.rangeList.getSelectedRec();
            if (rec) {
                this.api.asc_deleteUserProtectedRange([rec.get('props')]);
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
                } else {// record deselected
                    return;
                }
                this.currentNamedRange = _.indexOf(this.rangeList.store.models, record);
            }
            this.updateButtons();
        },

        hide: function () {
            this.userTipHide();
            Common.UI.Window.prototype.hide.call(this);
        },

        close: function () {
            this.userTipHide();
            this.api.asc_unregisterCallback('asc_onRefreshUserProtectedRangesList', this.wrapEvents.onRefreshUserProtectedRangesList);
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
            this.refreshRangeList();
        },

        onLockProtectedRangeManager: function(index) {
            if (this.currentSheet !== index) return;
            this.locked = true;
            this.updateButtons();
            if (this.userTooltip===true && this.rangeList.cmpEl.find('.lock-user').length>0)
                this.rangeList.cmpEl.on('mouseover',  _.bind(this.onMouseOverLock, this)).on('mouseout',  _.bind(this.onMouseOutLock, this));
        },

        onUnLockProtectedRangeManager: function(index) {
            if (this.currentSheet !== index) return;
            this.locked = false;
            this.updateButtons();
        },

        onLockProtectedRange: function(index, rangeId, userId) {
            if (this.currentSheet !== index) return;
            var store = this.rangeList.store,
                rec = store.findWhere({rangeId: rangeId});
            if (rec) {
                rec.set('lockuser', (userId) ? (this.isUserVisible(userId) ? this.getUserName(userId) : this.lockText) : this.guestText);
                rec.set('lock', true);
                this.updateButtons();
            }
            if (this.userTooltip===true && this.rangeList.cmpEl.find('.lock-user').length>0)
                this.rangeList.cmpEl.on('mouseover',  _.bind(this.onMouseOverLock, this)).on('mouseout',  _.bind(this.onMouseOutLock, this));
        },

        onUnLockProtectedRange: function(index, rangeId) {
            if (this.currentSheet !== index) return;
            var store = this.rangeList.store,
                rec = store.findWhere({rangeId: rangeId});
            if (rec) {
                rec.set('lockuser', '');
                rec.set('lock', false);
                this.updateButtons();
            }
        },

        updateButtons: function() {
            var rec = this.rangeList.getSelectedRec(),
                lock = rec ? rec.get('lock') : false,
                length = this.rangeList.store.length,
                canEdit = rec ? rec.get('canEdit') : false;
            this.btnDeleteRange.setDisabled(length<1 || lock || !canEdit);
            this.btnEditRange.setDisabled(length<1 || lock || !canEdit);
        },

        txtTitle: 'Protected Ranges',
        textRangesDesc: 'Ranges unlocked by a password when sheet is protected',
        textTitle: 'Title',
        textRange: 'Range',
        textNew: 'New',
        textEdit: 'Edit',
        textDelete: 'Delete',
        textEmpty: 'No protected ranges have been created yet.<br>Create at least one protected range and it will appear in this field.',
        guestText: 'Guest',
        tipIsLocked: 'This element is being edited by another user.',
        warnDelete: 'Are you sure you want to delete the name {0}?',
        textProtect: 'Protect Sheet',
        txtEdit: 'Edit',
        txtView: 'View',
        txtEditRange: 'Edit Range',
        txtNewRange: 'New Range',
        lockText: 'Locked',
        textFilter: 'Filter',
        textFilterAll: 'All',
        textYouCan: 'You can'

    }, SSE.Views.ProtectedRangesManagerDlg || {}));
});