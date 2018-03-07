/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  NameManagerDlg.js
 *
 *  Created by Julia.Radzhabova on 01.06.15
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([  'text!spreadsheeteditor/main/app/template/NameManagerDlg.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ListView',
    'common/main/lib/component/InputField'
], function (contentTemplate) {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.NameManagerDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'NameManagerDlg',
            contentWidth: 510,
            height: 353
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                template: [
                    '<div class="box" style="height:' + (this.options.height-85) + 'px;">',
                    '<div class="content-panel" style="padding: 0;">' + _.template(contentTemplate)({scope: this}) + '</div>',
                    '</div>',
                    '<div class="separator horizontal"/>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.closeButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.sheets     = options.sheets || [];
            this.sheetNames = options.sheetNames || [];
            this.ranges     = options.ranges || [];
            this.props      = options.props;
            this.sort       = options.sort || {type: 'name', direction: 1}; // ascend
            this.locked     = options.locked || false;
            this.userTooltip = true;
            this.currentNamedRange = undefined;

            this.rangesStore = new Common.UI.DataViewStore();

            this.wrapEvents = {
                onRefreshDefNameList: _.bind(this.onRefreshDefNameList, this),
                onLockDefNameManager: _.bind(this.onLockDefNameManager, this)
            };
            
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.cmbFilter = new Common.UI.ComboBox({
                el          : $('#name-manager-combo-filter'),
                menuStyle   : 'min-width: 100%;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [
                    { value: 0, displayValue: this.textFilterAll },
                    { value: 1, displayValue: this.textFilterDefNames },
                    { value: 2, displayValue: this.textFilterTableNames },
                    { value: 3, displayValue: this.textFilterSheet },
                    { value: 4, displayValue: this.textFilterWorkbook }
                ]
            }).on('selected', function(combo, record) {
                me.refreshRangeList(null, 0);
            });
            this.cmbFilter.setValue(0);

            this.rangeList = new Common.UI.ListView({
                el: $('#name-manager-range-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                emptyText: this.textEmpty,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                        '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;<% if (!lock) { %>pointer-events:none;<% } %>">',
                            '<div class="listitem-icon <% if (isTable) {%>listitem-table<%} %>"></div>',
                            '<div style="width:141px;padding-right: 5px;"><%= name %></div>',
                            '<div style="width:94px;padding-right: 5px;"><%= scopeName %></div>',
                            '<div style="width:212px;"><%= range %></div>',
                            '<% if (lock) { %>',
                                '<div class="lock-user"><%=lockuser%></div>',
                            '<% } %>',
                        '</div>'
                ].join(''))
            });
            this.rangeList.store.comparator = function(item1, item2) {
                var n1 = item1.get(me.sort.type).toLowerCase(),
                    n2 = item2.get(me.sort.type).toLowerCase();
                if (n1==n2) return 0;
                return (n1<n2) ? -me.sort.direction : me.sort.direction;
            };
            this.rangeList.on('item:select', _.bind(this.onSelectRangeItem, this))
                          .on('item:keydown', _.bind(this.onKeyDown, this))
                          .on('item:dblclick', _.bind(this.onDblClickItem, this))
                          .on('entervalue', _.bind(this.onDblClickItem, this));

            this.btnNewRange = new Common.UI.Button({
                el: $('#name-manager-btn-new')
            });
            this.btnNewRange.on('click', _.bind(this.onEditRange, this, false));

            this.btnEditRange = new Common.UI.Button({
                el: $('#name-manager-btn-edit')
            });
            this.btnEditRange.on('click', _.bind(this.onEditRange, this, true));
            
            this.btnDeleteRange = new Common.UI.Button({
                el: $('#name-manager-btn-delete')
            });
            this.btnDeleteRange.on('click', _.bind(this.onDeleteRange, this));

            $('#name-manager-sort-name').on('click', _.bind(this.onSortNames, this, 'name'));
            $('#name-manager-sort-scope').on('click', _.bind(this.onSortNames, this, 'scopeName'));
            this.spanSortName = $('#name-manager-sort-name-span');
            this.spanSortScope = $('#name-manager-sort-scope-span');
            (this.sort.type=='name') ? this.spanSortScope.addClass('hidden') : this.spanSortName.addClass('hidden');
            if (this.sort.direction<0) {
                (this.sort.type=='name') ? this.spanSortName.addClass('sort-desc') : this.spanSortScope.addClass('sort-desc');
            }

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            this.refreshRangeList(this.ranges, 0);
            this.api.asc_registerCallback('asc_onLockDefNameManager', this.wrapEvents.onLockDefNameManager);
            this.api.asc_registerCallback('asc_onRefreshDefNameList', this.wrapEvents.onRefreshDefNameList);
        },

        onRefreshDefNameList: function() {
            this.refreshRangeList(this.api.asc_getDefinedNames(Asc.c_oAscGetDefinedNamesList.All), this.currentNamedRange);
        },

        refreshRangeList: function(ranges, selectedItem) {
            if (ranges) {
                this.ranges = ranges;
                var arr = [];
                for (var i=0; i<this.ranges.length; i++) {
                    var scope = this.ranges[i].asc_getScope(),
                        id = this.ranges[i].asc_getIsLock();
                    arr.push({
                        name: this.ranges[i].asc_getName(),
                        scope: scope,
                        scopeName: (scope===null) ? this.textWorkbook: this.sheetNames[scope],
                        range: this.ranges[i].asc_getRef(),
                        isTable: (this.ranges[i].asc_getIsTable()===true),
                        lock: (id!==null && id!==undefined),
                        lockuser: (id) ? this.getUserName(id) : this.guestText
                    });
                }
                this.rangesStore.reset(arr);
                this.rangeList.setEmptyText((this.rangesStore.length>0) ? this.textnoNames : this.textEmpty);
            }

            var me = this,
                store = this.rangeList.store,
                models = this.rangesStore.models,
                val = this.cmbFilter.getValue(),
                isTableFilter = (val<3) ? (val==2) : -1,
                isWorkbook = (val>2) ? (val==4) : -1;
            if (val>0)
                models = this.rangesStore.filter(function(item) {
                    if (isTableFilter!==-1)
                        return (isTableFilter===item.get('isTable'));
                    if (isWorkbook!==-1)
                        return (isWorkbook===(item.get('scope')===null));
                    return false;
                });

            store.reset(models, {silent: false});

            val = store.length;
            this.btnEditRange.setDisabled(!val);
            this.btnDeleteRange.setDisabled(!val);
            if (val>0) {
                if (selectedItem===undefined || selectedItem===null) selectedItem = 0;
                if (_.isNumber(selectedItem)) {
                    if (selectedItem>val-1) selectedItem = val-1;
                    this.rangeList.selectByIndex(selectedItem);
                    setTimeout(function() {
                        me.rangeList.scrollToRecord(store.at(selectedItem));
                    }, 50);

                } else if (selectedItem){ // object
                    var rec = store.findWhere({name: selectedItem.asc_getName(), scope: selectedItem.asc_getScope()});
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
                me.rangeList.cmpEl.find('.listview').focus();
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
                idx = _.indexOf(this.rangeList.store.models, rec[0]),
                oldname = (isEdit && rec.length>0) ? new Asc.asc_CDefName(rec[0].get('name'), rec[0].get('range'), rec[0].get('scope'), rec[0].get('isTable')) : null;

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
                _.delay(function () {
                    me.rangeList.cmpEl.find('.listview').focus();
                }, 100, me);
            });
            
            me.hide();
            win.show(xy.left + 65, xy.top + 77);
        },

        onDeleteRange: function () {
            var rec = this.rangeList.getSelectedRec();
            if (rec.length>0) {
                this.currentNamedRange = _.indexOf(this.rangeList.store.models, rec[0]);
                this.api.asc_delDefinedNames(new Asc.asc_CDefName(rec[0].get('name'), rec[0].get('range'), rec[0].get('scope'), rec[0].get('isTable')));
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

        onSortNames: function(type) {
            if (type !== this.sort.type) {
                this.sort = {type: type, direction: 1};
                this.spanSortName.toggleClass('hidden');
                this.spanSortScope.toggleClass('hidden');
            } else {
                this.sort.direction = -this.sort.direction;
            }
            var sorted = (type=='name') ? this.spanSortName : this.spanSortScope;
            (this.sort.direction>0) ? sorted.removeClass('sort-desc') : sorted.addClass('sort-desc');

            this.rangeList.store.sort();
            this.rangeList.onResetItems();
            this.rangeList.scroller.update({alwaysVisibleY: true});
        },

        getUserName: function(id){
            var usersStore = SSE.getCollection('Common.Collections.Users');
            if (usersStore){
                var rec = usersStore.findUser(id);
                if (rec)
                    return rec.get('username');
            }
            return this.guestText;
        },

        onSelectRangeItem: function(lisvView, itemView, record) {
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
                this.btnDeleteRange.setDisabled(rawData.lock || rawData.isTable);
            }
        },

        hide: function () {
            this.userTipHide();
            Common.UI.Window.prototype.hide.call(this);
        },

        close: function () {
            this.userTipHide();
            this.api.asc_unregisterCallback('asc_onLockDefNameManager', this.wrapEvents.onLockDefNameManager);
            this.api.asc_unregisterCallback('asc_onRefreshDefNameList', this.wrapEvents.onRefreshDefNameList);

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

        onLockDefNameManager: function(state) {
            this.locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);
        },
        
        txtTitle: 'Name Manager',
        closeButtonText : 'Close',
        okButtonText : 'Ok',
        textDataRange: 'Data Range',
        textNew: 'New',
        textEdit: 'Edit',
        textDelete: 'Delete',
        textRanges: 'Named Ranges',
        textScope: 'Scope',
        textFilter: 'Filter',
        textEmpty: 'No named ranges have been created yet.<br>Create at least one named range and it will appear in this field.',
        textnoNames: 'No named ranges matching your filter could be found.',
        textFilterAll: 'All',
        textFilterDefNames: 'Defined names',
        textFilterTableNames: 'Table names',
        textFilterSheet: 'Names Scoped to Sheet',
        textFilterWorkbook: 'Names Scoped to Workbook',
        textWorkbook: 'Workbook',
        guestText: 'Guest',
        tipIsLocked: 'This element is being edited by another user.'

    }, SSE.Views.NameManagerDlg || {}));
});