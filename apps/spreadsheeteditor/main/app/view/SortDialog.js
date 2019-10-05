/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 *  SortDialog.js
 *
 *  Created by Julia.Radzhabova on 05.10.19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */

define([  'text!spreadsheeteditor/main/app/template/SortDialog.template',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/ListView',
    'spreadsheeteditor/main/app/view/SortOptionsDialog'
], function (contentTemplate) {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.SortDialog =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'SortDialog',
            contentWidth: 500,
            height: 285,
            buttons: ['ok', 'cancel']
        },

        initialize: function (options) {
            var me = this;
            _.extend(this.options, {
                title: this.txtTitle,
                template: [
                    '<div class="box" style="height:' + (this.options.height-85) + 'px;">',
                    '<div class="content-panel" style="padding: 0;">' + _.template(contentTemplate)({scope: this}) + '</div>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.props      = options.props;

            this.sortOptions = {};
            this.sortStore = new Common.UI.DataViewStore();

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.sortList = new Common.UI.ListView({
                el: $('#sort-dialog-list', this.$window),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                emptyText: '',
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                        '<div id="<%= id %>" class="list-item" style="width: 100%;display:inline-block;">',
                            '<div class="listitem-icon <% if (isTable) {%>listitem-table<%} %>"></div>',
                            '<div style="width:141px;padding-right: 5px;"><%= name %></div>',
                            '<div style="width:94px;padding-right: 5px;"><%= scopeName %></div>',
                            '<div style="width:212px;"><%= range %></div>',
                        '</div>'
                ].join(''))
            });
            // this.rangeList.on('item:select', _.bind(this.onSelectLevel, this))
            //               .on('item:keydown', _.bind(this.onKeyDown, this));

            this.btnAdd = new Common.UI.Button({
                el: $('#sort-dialog-btn-add')
            });
            // this.btnAdd.on('click', _.bind(this.onAddLevel, this, false));

            this.btnDelete = new Common.UI.Button({
                el: $('#sort-dialog-btn-delete')
            });
            // this.btnDelete.on('click', _.bind(this.onDeleteLevel, this));

            this.btnCopy = new Common.UI.Button({
                el: $('#sort-dialog-btn-copy')
            });
            // this.btnCopy.on('click', _.bind(this.onCopyLevel, this, false));

            this.btnOptions = new Common.UI.Button({
                el: $('#sort-dialog-btn-options')
            });
            this.btnOptions.on('click', _.bind(this.onOptions, this, false));

            this.btnUp = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-incfont',
                hint: this.textUp
            });
            this.btnUp.render($('#sort-dialog-btn-up')) ;
            // this.btnUp.on('click', _.bind(this.onUpClick, this));

            this.btnDown = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'btn-decfont',
                hint: this.textDown
            });
            this.btnDown.render($('#sort-dialog-btn-down')) ;
            // this.btnDown.on('click', _.bind(this.onDownClick, this));

            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                this.sortOptions = {
                    headers: props.asc_getHasHeaders(),
                    // sensitive: props.asc_getCaseSensitive(),
                    sort: props.asc_getColumnSort()
                };
            }
        },

        refreshRangeList: function(ranges, selectedItem) {
            if (ranges) {
                this.ranges = ranges;
                var arr = [];
                for (var i=0; i<this.ranges.length; i++) {
                    var scope = this.ranges[i].asc_getScope(),
                        id = this.ranges[i].asc_getIsLock();
                    arr.push({
                        name: this.ranges[i].asc_getName(true),
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
                me.rangeList.cmpEl.find('.listview').focus();
                me.rangeList.scroller.update({alwaysVisibleY: true});
            }, 100, this);
        },

        onOptions: function () {
            var me = this;

            var win = new SSE.Views.SortOptionsDialog({
                props: me.sortOptions,
                handler : function(result, settings) {
                    if (result == 'ok' && settings) {
                        me.sortOptions = settings;
                    }
                }
            });
            win.show();
        },

        getSettings: function() {
            var props = new Asc.CSortProperties();
            props.asc_setHasHeaders(this.sortOptions.headers);
            // props.asc_setCaseSensitive(this.sortOptions.sensitive);
            props.asc_setColumnSort(this.sortOptions.sort);

            return {};
        },

        close: function () {
            Common.UI.Window.prototype.close.call(this);
        },

        onKeyDown: function (lisvView, record, e) {
            if (e.keyCode==Common.UI.Keys.DELETE && !this.btnDelete.isDisabled())
                this.onDeletelevel();
        },

        txtTitle: 'Sort',
        textAdd: 'Add level',
        textDelete: 'Delete level',
        textCopy: 'Copy level',
        textColumn: 'Column',
        textSort: 'Sort on',
        textOrder: 'Order',
        textUp: 'Move level up',
        textDown: 'Move level down',
        textOptions: 'Options'

    }, SSE.Views.SortDialog || {}));
});