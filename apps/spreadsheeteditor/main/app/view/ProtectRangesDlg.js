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
 *  ProtectRangesDlg.js
 *
 *  Created on 22.06.21
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/ProtectRangesDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.ProtectRangesDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'ProtectRangesDlg',
            contentWidth: 480,
            separator: false,
            id: 'window-protect-ranges'
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
            this.locked     = options.locked || false;
            this.userTooltip = true;
            this.currentRange = undefined;
            this.deletedArr = [];

            this.wrapEvents = {
                onLockProtectedRangeManager: _.bind(this.onLockProtectedRangeManager, this),
                onUnLockProtectedRangeManager: _.bind(this.onUnLockProtectedRangeManager, this),
                onLockProtectedRange: _.bind(this.onLockProtectedRange, this),
                onUnLockProtectedRange: _.bind(this.onUnLockProtectedRange, this)
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.rangeList = new Common.UI.ListView({
                el: $('#protect-ranges-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: this.textEmpty,
                headers: [
                    {name: this.textTitle, width:184},
                    {name: this.textRange, width:180},
                    {name: this.textPwd,   width:82},
                ],
                itemTemplate: _.template([
                        '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;<% if (!lock) { %>pointer-events:none;<% } %>">',
                            '<div class="padding-right-5" style="width:184px;"><%= Common.Utils.String.htmlEncode(name) %></div>',
                            '<div class="padding-right-5" style="width:180px;"><%= range %></div>',
                            '<div style="width:70px;"><% if (pwd) { %>', me.txtYes, '<% } else { %>', me.txtNo, '<% } %></div>',
                            '<% if (lock) { %>',
                                '<div class="lock-user"><%=Common.Utils.String.htmlEncode(lockuser)%></div>',
                            '<% } %>',
                        '</div>'
                ].join('')),
                tabindex: 1
            });
            this.rangeList.store.comparator = function(item1, item2) {
                var n1 = item1.get('name').toLowerCase(),
                    n2 = item2.get('name').toLowerCase();
                if (n1==n2) return 0;
                return (n1<n2) ? -1 : 1;
            };
            this.rangeList.on('item:select', _.bind(this.onSelectRangeItem, this))
                          .on('item:keydown', _.bind(this.onKeyDown, this))
                          .on('item:dblclick', _.bind(this.onDblClickItem, this))
                          .on('entervalue', _.bind(this.onDblClickItem, this));

            this.btnNewRange = new Common.UI.Button({
                el: $('#protect-ranges-btn-new')
            });
            this.btnNewRange.on('click', _.bind(this.onEditRange, this, false));

            this.btnEditRange = new Common.UI.Button({
                el: $('#protect-ranges-btn-edit')
            });
            this.btnEditRange.on('click', _.bind(this.onEditRange, this, true));
            
            this.btnDeleteRange = new Common.UI.Button({
                el: $('#protect-ranges-btn-delete')
            });
            this.btnDeleteRange.on('click', _.bind(this.onDeleteRange, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.btnNewRange, this.btnEditRange, this.btnDeleteRange, this.rangeList].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.rangeList;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            this.refreshRangeList(props, 0);
            this.currentSheet = this.api.asc_getActiveWorksheetIndex();
            this.api.asc_registerCallback('asc_onLockProtectedRangeManager', this.wrapEvents.onLockProtectedRangeManager);
            this.api.asc_registerCallback('asc_onUnLockProtectedRangeManager', this.wrapEvents.onUnLockProtectedRangeManager);
            this.api.asc_registerCallback('asc_onLockProtectedRange', this.wrapEvents.onLockProtectedRange);
            this.api.asc_registerCallback('asc_onUnLockProtectedRange', this.wrapEvents.onUnLockProtectedRange);
        },

        refreshRangeList: function(ranges, selectedItem) {
            if (ranges) {
                var arr = [];
                for (var i=0; i<ranges.length; i++) {
                    var id = ranges[i].asc_getIsLock();
                    arr.push({
                        name: ranges[i].asc_getName() || '',
                        pwd: ranges[i].asc_isPassword(),
                        range: ranges[i].asc_getSqref() || '',
                        rangeId: ranges[i].asc_getId(),
                        props: ranges[i],
                        rangeChanged: false, // true if was edited in or was created, need to send this rule to sdk if true
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
            if (this._isWarningVisible) return;
            
            if (this.locked) {
                Common.NotificationCenter.trigger('protectedrange:locked');
                return;
            }
            var me = this,
                xy = me.$window.offset(),
                rec = this.rangeList.getSelectedRec(),
                props;
            if (isEdit)
                props = rec.get('props');
            else {
                props = new Asc.CProtectedRange();
                props.asc_setSqref(me.api.asc_getActiveRangeStr(Asc.referenceType.A));
            }
            var names = [];
            this.rangeList.store.each(function(item){
                names.push(item.get('name').toLowerCase());
            });

            var win = new SSE.Views.ProtectDialog({
                title   : isEdit ? me.txtEditRange : me.txtNewRange,
                type    : 'range',
                props   : props,
                names   : names,
                isEdit  : isEdit,
                api     : me.api,
                buttons : ['ok', 'cancel'],
                handler : function(result, value, props) {
                    if (result == 'ok') {
                        value && props.asc_setPassword(value);
                        if (isEdit) {
                            rec.set('props', props);
                            rec.set('name', props.asc_getName());
                            rec.set('range', props.asc_getSqref());
                            rec.set('pwd', props.asc_isPassword());
                            rec.set('rangeChanged', true);
                        } else {
                            rec = me.rangeList.store.add({
                                name: props.asc_getName(),
                                pwd: props.asc_isPassword(),
                                range: props.asc_getSqref(),
                                props: props,
                                isNew: true,
                                rangeChanged: true,
                                lock: false,
                                lockuser: this.guestText
                            });
                            me.rangeList.selectRecord(rec);
                            me.rangeList.scrollToRecord(me.rangeList.getSelectedRec());
                            me.updateButtons();
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
                !rec.get('isNew') && this.deletedArr.push(rec.get('props'));
                var index = store.indexOf(rec);
                store.remove(rec);
                (store.length>0) && this.rangeList.selectByIndex(index);
                this.rangeList.scrollToRecord(this.rangeList.getSelectedRec());
            }
            this.updateButtons();
        },

        getSettings: function() {
            var arr = [];
            this.rangeList.store.each(function(item){
                item.get('rangeChanged') && arr.push(item.get('props'));
            });
            return {arr: arr, deletedArr: this.deletedArr};
        },

        onDlgBtnClick: function(event) {
            this.handler && this.handler.call(this, event.currentTarget.attributes['result'].value, this.getSettings());
            this.close();
        },

        getUserName: function(id){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
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
            this.api.asc_unregisterCallback('asc_onLockProtectedRangeManager', this.wrapEvents.onLockProtectedRangeManager);
            this.api.asc_unregisterCallback('asc_onUnLockProtectedRangeManager', this.wrapEvents.onUnLockProtectedRangeManager);
            this.api.asc_unregisterCallback('asc_onLockProtectedRange', this.wrapEvents.onLockProtectedRange);
            this.api.asc_unregisterCallback('asc_onUnLockProtectedRange', this.wrapEvents.onUnLockProtectedRange);
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
                length = this.rangeList.store.length;
            this.btnDeleteRange.setDisabled(length<1 || lock);
            this.btnEditRange.setDisabled(length<1 || lock);
        },

        txtTitle: 'Allow Users to Edit Ranges',
        textRangesDesc: 'Ranges unlocked by a password when sheet is protected (this works only for locked cells)',
        textTitle: 'Title',
        textRange: 'Range',
        textPwd: 'Password',
        textNew: 'New',
        textEdit: 'Edit',
        textDelete: 'Delete',
        textEmpty: 'No ranges allowed for edit.',
        guestText: 'Guest',
        tipIsLocked: 'This element is being edited by another user.',
        warnDelete: 'Are you sure you want to delete the name {0}?',
        textProtect: 'Protect Sheet',
        txtYes: 'Yes',
        txtNo: 'No',
        txtEditRange: 'Edit Range',
        txtNewRange: 'New Range',
        lockText: 'Locked'

    }, SSE.Views.ProtectRangesDlg || {}));
});