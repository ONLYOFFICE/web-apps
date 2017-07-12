/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *  PivotSettings.js
 *
 *  Created by Julia Radzhabova on 7/10/17
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/PivotSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/ListView'
], function (menuTemplate, $, _, Backbone, Sortable) {
    'use strict';

    SSE.Views.PivotSettings = Backbone.View.extend(_.extend({
        el: '#id-pivot-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'PivotSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                TableName: '',
                TemplateName: '',
                Range: '',
                CheckHeader: false,
                CheckTotal: false,
                CheckBanded: false,
                CheckFirst: false,
                CheckLast: false,
                CheckColBanded: false,
                CheckFilter: false,
                DisabledControls: false,
                TableNameError: false
            };
            this.lockedControls = [];
            this._locked = false;

            this._originalProps = null;
            this._noApply = false;

            this.render();
        },

        onCheckTemplateChange: function(type, stateName, field, newValue, oldValue, eOpts) {
            this._state[stateName] = undefined;
            if (this.api)
                this.api.asc_changeFormatTableInfo(this._state.TableName, type, newValue=='checked');
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onTableTemplateSelect: function(combo, record){
            if (this.api && !this._noApply) {
                this.api.asc_changeAutoFilter(this._state.TableName, Asc.c_oAscChangeFilterOptions.style, record.get('name'));
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onEditClick: function(menu, item, e) {
            if (this.api) {
                if (item.options.idx>=0 && item.options.idx<4)
                    this.api.asc_changeSelectionFormatTable(this._state.TableName, item.value);
                else if (item.options.idx>=4 && item.options.idx<8) {
                    this.api.asc_insertCellsInTable(this._state.TableName, item.value);
                } else {
                    this.api.asc_deleteCellsInTable(this._state.TableName, item.value);
                }
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onTableNameChanged: function(input, newValue, oldValue) {
            var oldName = this._state.TableName;
            this._state.TableName = '';

            if (oldName.toLowerCase() == newValue.toLowerCase()) {
                Common.NotificationCenter.trigger('edit:complete', this);
                return;
            }

            var me = this,
                isvalid = this.api.asc_checkDefinedName(newValue, null);
            if (isvalid.asc_getStatus() === true) isvalid = true;
            else {
                switch (isvalid.asc_getReason()) {
                    case Asc.c_oAscDefinedNameReason.IsLocked:
                        isvalid = this.textIsLocked;
                    break;
                    case Asc.c_oAscDefinedNameReason.Existed:
                        isvalid = this.textExistName;
                    break;
                    case Asc.c_oAscDefinedNameReason.NameReserved:
                        isvalid = this.textReservedName;
                    break;
                    default:
                        isvalid = this.textInvalidName;
                }
            }
            if (isvalid === true) {
                this.api.asc_changeDisplayNameTable(oldName, newValue);
                Common.NotificationCenter.trigger('edit:complete', this);
            } else if (!this._state.TableNameError) {
                this._state.TableNameError = true;
                Common.UI.alert({
                    msg: isvalid,
                    title: this.notcriticalErrorTitle,
                    iconCls: 'warn',
                    buttons: ['ok'],
                    callback: function(btn){
                        Common.NotificationCenter.trigger('edit:complete', this);
                        me._state.TableNameError = false;
                    }
                });
            }
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.linkAdvanced = $('#table-advanced-link');
        },

        setApi: function(o) {
            this.api = o;
            return this;
        },

        createDelayedControls: function() {
            var me = this;
            this.fieldsList = new Common.UI.ListView({
                el: $('#pivot-list-fields'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div>',
                    '<label class="checkbox-indeterminate" style="position:absolute;">',
                    '<% if (check) { %>',
                    '<input type="button" class="checked img-commonctrl"/>',
                    '<% } else { %>',
                    '<input type="button" class="img-commonctrl"/>',
                    '<% } %>',
                    '</label>',
                    '<div id="<%= id %>" class="list-item" style="pointer-events:none;"><%= Common.Utils.String.htmlEncode(value) %></div>',
                    '</div>'
                ].join(''))
            });
            this.fieldsList.on('item:select', _.bind(this.onFieldsCheck, this));
            // this.fieldsList.onKeyDown = _.bind(this.onFieldsListKeyDown, this);
            this.lockedControls.push(this.fieldsList);

            // Sortable.create(this.fieldsList.$el.find('.listview')[0], {});

            this.columnsList = new Common.UI.ListView({
                el: $('#pivot-list-columns'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="display:inline-block;">',
                    '<div style=""><%= Common.Utils.String.htmlEncode(value) %></div>',
                    '<div class="listitem-icon"></div>',
                    '</div>'
                ].join(''))
            });
            // this.columnsList.on('item:select', _.bind(this.onColumnsSelect, this));
            // this.columnsList.onKeyDown = _.bind(this.onColumnsListKeyDown, this);
            this.lockedControls.push(this.columnsList);

            this.rowsList = new Common.UI.ListView({
                el: $('#pivot-list-rows'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="display:inline-block;">',
                    '<div style=""><%= Common.Utils.String.htmlEncode(value) %></div>',
                    '<div class="listitem-icon"></div>',
                    '</div>'
                ].join(''))
            });
            // this.rowsList.on('item:select', _.bind(this.onRowSelect, this));
            // this.rowsList.onKeyDown = _.bind(this.onRowsListKeyDown, this);
            this.lockedControls.push(this.rowsList);

            this.valuesList = new Common.UI.ListView({
                el: $('#pivot-list-values'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="display:inline-block;">',
                    '<div style=""><%= Common.Utils.String.htmlEncode(value) %></div>',
                    '<div class="listitem-icon"></div>',
                    '</div>'
                ].join(''))
            });
            // this.valuesList.on('item:select', _.bind(this.onValuesSelect, this));
            // this.valuesList.onKeyDown = _.bind(this.onValuesListKeyDown, this);
            this.lockedControls.push(this.valuesList);

            this.filtersList = new Common.UI.ListView({
                el: $('#pivot-list-filters'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="display:inline-block;">',
                    '<div style=""><%= Common.Utils.String.htmlEncode(value) %></div>',
                    '<div class="listitem-icon"></div>',
                    '</div>'
                ].join(''))
            });
            // this.filtersList.on('item:select', _.bind(this.onFiltersSelect, this));
            // this.filtersList.onKeyDown = _.bind(this.onFiltersListKeyDown, this);
            this.lockedControls.push(this.filtersList);

            $(this.el).on('click', '#pivot-advanced-link', _.bind(this.openAdvancedSettings, this));

            this._initSettings = false;
        },

        openAdvancedSettings: function(e) {
            if (this.linkAdvanced.hasClass('disabled')) return;

            var me = this;
            var win;
            if (me.api && !this._locked){
                (new SSE.Views.TableSettingsAdvanced(
                    {
                        tableProps: me._originalProps,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok' && me.api && value) {
                                me.api.asc_changeFormatTableInfo(me._state.TableName, Asc.c_oAscChangeTableStyleInfo.advancedSettings, value);
                            }

                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    })).show();
            }
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedControls();

            this.disableControls(this._locked); // need to update combodataview after disabled state

            if (props )//formatTableInfo
            {
                this._originalProps = props;

                this._state.TableName=props.asc_getName();

                var me = this,
                    cache_names = props.asc_getCacheFields(),
                    pivot_names = props.asc_getPivotFields(),
                    names = [];
                pivot_names.forEach(function (item, index) {
                    names[index] = item.asc_getName() || cache_names[index].asc_getName();
                });

                var arr = [], isChecked = [],
                value = props.asc_getColumnFields();
                value && value.forEach(function (item) {
                    var index = item.asc_getIndex();
                    if (index>-1 || index == -2) {
                        var name = (index>-1) ? names[index] : me.textValues;
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : true,
                            index           : index,
                            value            : name,
                            tip             : (name.length>10) ? name : ''
                        }));
                        isChecked[name] = true;
                    }
                });
                this.columnsList.store.reset(arr);
                this.columnsList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});

                arr = [];
                value = props.asc_getRowFields();
                value && value.forEach(function (item) {
                    var index = item.asc_getIndex();
                    if (index>-1 || index == -2) {
                        var name = (index>-1) ? names[index] : me.textValues;
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : true,
                            index           : index,
                            value            : name,
                            tip             : (name.length>10) ? name : ''
                        }));
                        isChecked[name] = true;
                    }
                });
                this.rowsList.store.reset(arr);
                this.rowsList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});

                arr = [];
                value = props.asc_getDataFields();
                value && value.forEach(function (item) {
                    var index = item.asc_getIndex();
                    if (index>-1) {
                        var name = item.asc_getName();
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : true,
                            index           : index,
                            value           : name,
                            tip             : (name.length>10) ? name : ''
                        }));
                        isChecked[name] = true;
                    }
                });
                this.valuesList.store.reset(arr);
                this.valuesList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});

                arr = [];
                value = props.asc_getPageFields();
                value && value.forEach(function (item) {
                    var index = item.asc_getIndex();
                    if (index>-1) {
                        var name = names[index];
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : true,
                            index           : index,
                            value            : name,
                            tip             : (name.length>10) ? name : ''
                        }));
                        isChecked[name] = true;
                    }
                });
                this.filtersList.store.reset(arr);
                this.filtersList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});

                arr = [];
                names.forEach(function (item) {
                    arr.push(new Common.UI.DataViewModel({
                        selected        : false,
                        allowSelected   : true,
                        value           : item,
                        tip             : (name.length>25) ? name : '',
                        check           : isChecked[item]
                    }));
                });
                this.fieldsList.store.reset(arr);
                this.fieldsList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});
            }
        },

        onFieldsCheck: function (listView, itemView, record) {
            if (this.checkCellTrigerBlock)
                return;

            var target = '', type = '', isLabel = false, bound = null;

            var event = window.event ? window.event : window._event;
            if (event) {
                type = event.target.type;
                target = $(event.currentTarget).find('.list-item');

                if (target.length) {
                    bound = target.get(0).getBoundingClientRect();
                    var _clientX = event.clientX*Common.Utils.zoom(),
                        _clientY = event.clientY*Common.Utils.zoom();
                    if (bound.left < _clientX && _clientX < bound.right &&
                        bound.top < _clientY && _clientY < bound.bottom) {
                        isLabel = true;
                    }
                }

                if (type === 'button' || isLabel) {
                    this.updateFieldCheck(listView, record);

                    _.delay(function () {
                        listView.$el.find('.listview').focus();
                    }, 100, this);
                }
            }
        },

        updateFieldCheck: function (listView, record) {
            if (record && listView) {
                listView.isSuspendEvents = true;

                record.set('check', !record.get('check'));

                listView.isSuspendEvents = false;
                listView.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});
            }
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.linkAdvanced.toggleClass('disabled', disable);
            }
        },

        textFields:             'Select Fields',
        textOK                  : 'OK',
        textCancel              : 'Cancel',
        textValues              : 'Values',
        textRows                : 'Rows',
        textColumns             : 'Columns',
        textFilters             : 'Filters',
        notcriticalErrorTitle   : 'Warning',
        textAdvanced:   'Show advanced settings'

    }, SSE.Views.PivotSettings || {}));
});