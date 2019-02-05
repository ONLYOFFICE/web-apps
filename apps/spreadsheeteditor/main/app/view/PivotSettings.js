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
 *  PivotSettings.js
 *
 *  Created by Julia Radzhabova on 7/10/17
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/PivotSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/ListView',
    'spreadsheeteditor/main/app/view/FieldSettingsDialog',
    'spreadsheeteditor/main/app/view/ValueFieldSettingsDialog',
    'spreadsheeteditor/main/app/view/PivotSettingsAdvanced'
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
                names: [],
                DisabledControls: false,
                field: {}
            };
            this.lockedControls = [];
            this._locked = false;

            this._originalProps = null;
            this._noApply = false;

            this.render();
        },

        render: function () {
            var el = $(this.el);
            el.html(this.template({
                scope: this
            }));

            this.linkAdvanced = $('#pivot-advanced-link');
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
                    '<div class="listitem-icon img-commonctrl"></div>',
                    '</div>'
                ].join(''))
            });
            this.fieldsList.on('item:click', _.bind(this.onFieldsCheck, this));
            // this.fieldsList.onKeyDown = _.bind(this.onFieldsListKeyDown, this);
            this.lockedControls.push(this.fieldsList);

            // Sortable.create(this.fieldsList.$el.find('.listview')[0], {});

            var itemTemplate = _.template([
                '<div id="<%= id %>" class="list-item" style="display:inline-block;">',
                '<div style=""><%= Common.Utils.String.htmlEncode(value) %></div>',
                '<div class="listitem-icon img-commonctrl"></div>',
                '</div>'
            ].join(''));
            this.columnsList = new Common.UI.ListView({
                el: $('#pivot-list-columns'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: itemTemplate
            });
            this.columnsList.on('item:click', _.bind(this.onColumnsSelect, this, 0));
            // this.columnsList.onKeyDown = _.bind(this.onColumnsListKeyDown, this);
            this.lockedControls.push(this.columnsList);

            this.rowsList = new Common.UI.ListView({
                el: $('#pivot-list-rows'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: itemTemplate
            });
            this.rowsList.on('item:click', _.bind(this.onColumnsSelect, this, 1));
            // this.rowsList.onKeyDown = _.bind(this.onRowsListKeyDown, this);
            this.lockedControls.push(this.rowsList);

            this.valuesList = new Common.UI.ListView({
                el: $('#pivot-list-values'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: itemTemplate
            });
            this.valuesList.on('item:click', _.bind(this.onColumnsSelect, this, 2));
            // this.valuesList.onKeyDown = _.bind(this.onValuesListKeyDown, this);
            this.lockedControls.push(this.valuesList);

            this.filtersList = new Common.UI.ListView({
                el: $('#pivot-list-filters'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: itemTemplate
            });
            this.filtersList.on('item:click', _.bind(this.onColumnsSelect, this,3));
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
                (new SSE.Views.PivotSettingsAdvanced(
                    {
                        props: me._originalProps,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok' && me.api && value) {
                                me._originalProps.asc_set(me.api, value);
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
                    pivot_names = props.asc_getPivotFields();

                this._state.names = [];
                pivot_names.forEach(function (item, index) {
                    me._state.names[index] = item.asc_getName() || cache_names[index].asc_getName();
                });

                var arr = [], isChecked = [],
                value = props.asc_getColumnFields();
                value && value.forEach(function (item, index) {
                    var pivotIndex = item.asc_getIndex();
                    if (pivotIndex>-1 || pivotIndex == -2) {
                        var name = (pivotIndex>-1) ? me._state.names[pivotIndex] : me.textValues;
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : false,
                            pivotIndex      : pivotIndex,
                            index           : index,
                            value           : name,
                            tip             : (name.length>10) ? name : ''
                        }));
                        isChecked[name] = true;
                    }
                });
                this.columnsList.store.reset(arr);
                this.columnsList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});

                arr = [];
                value = props.asc_getRowFields();
                value && value.forEach(function (item, index) {
                    var pivotIndex = item.asc_getIndex();
                    if (pivotIndex>-1 || pivotIndex == -2) {
                        var name = (pivotIndex>-1) ? me._state.names[pivotIndex] : me.textValues;
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : false,
                            pivotIndex      : pivotIndex,
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
                value && value.forEach(function (item, index) {
                    var pivotIndex = item.asc_getIndex();
                    if (pivotIndex>-1) {
                        var name = item.asc_getName();
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : false,
                            pivotIndex      : pivotIndex,
                            index           : index,
                            value           : name,
                            tip             : (name.length>10) ? name : ''
                        }));
                        isChecked[me._state.names[pivotIndex]] = true;
                    }
                });
                this.valuesList.store.reset(arr);
                this.valuesList.scroller.update({minScrollbarLength  : 40, alwaysVisibleY: true, suppressScrollX: true});

                arr = [];
                value = props.asc_getPageFields();
                value && value.forEach(function (item, index) {
                    var pivotIndex = item.asc_getIndex();
                    if (pivotIndex>-1) {
                        var name = me._state.names[pivotIndex];
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : false,
                            pivotIndex      : pivotIndex,
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
                me._state.names.forEach(function (item, index) {
                    arr.push(new Common.UI.DataViewModel({
                        selected        : false,
                        allowSelected   : false,
                        value           : item,
                        index           : index,
                        tip             : (item.length>25) ? item : '',
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

                var btn = $(event.target);
                if (btn && btn.hasClass('listitem-icon')) {
                    this._state.field = {record: record};
                    if (this.pivotFieldsMenu) {
                        if (this.pivotFieldsMenu.isVisible()) {
                            this.pivotFieldsMenu.hide();
                            return;
                        }
                    } else {
                        this.miAddFilter = new Common.UI.MenuItem({
                            caption     : this.txtAddFilter,
                            checkable   : false
                        });
                        this.miAddFilter.on('click', _.bind(this.onAddFilter, this));
                        this.miAddRow = new Common.UI.MenuItem({
                            caption     : this.txtAddRow,
                            checkable   : false
                        });
                        // this.miAddRow.on('click', _.bind(this.onAddRow, this));
                        this.miAddColumn = new Common.UI.MenuItem({
                            caption     : this.txtAddColumn,
                            checkable   : false
                        });
                        // this.miAddColumn.on('click', _.bind(this.onAddColumn, this));
                        this.miAddValues = new Common.UI.MenuItem({
                            caption     : this.txtAddValues,
                            checkable   : false
                        });
                        // this.miAddValues.on('click', _.bind(this.onAddValues, this));

                        this.pivotFieldsMenu = new Common.UI.Menu({
                            menuAlign: 'tr-br',
                            items: [
                                this.miAddFilter,
                                this.miAddRow,
                                this.miAddColumn,
                                this.miAddValues
                            ]
                        });
                    }

                    var recIndex = (record != undefined) ? record.get('index') : -1;

                    var menu = this.pivotFieldsMenu,
                        showPoint, me = this,
                        currentTarget = $(event.currentTarget),
                        parent = $(this.el),
                        offset = currentTarget.offset(),
                        offsetParent = parent.offset();

                    showPoint = [offset.left - offsetParent.left + currentTarget.width(), offset.top - offsetParent.top + currentTarget.height()/2];

                    var menuContainer = parent.find('#menu-pivot-fields-container');
                    if (!menu.rendered) {
                        if (menuContainer.length < 1) {
                            menuContainer = $('<div id="menu-pivot-fields-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id);
                            parent.append(menuContainer);
                        }
                        menu.render(menuContainer);
                        menu.cmpEl.attr({tabindex: "-1"});

                        menu.on('show:after', function(cmp) {
                            if (cmp && cmp.menuAlignEl)
                                cmp.menuAlignEl.toggleClass('over', true);
                        }).on('hide:after', function(cmp) {
                            if (cmp && cmp.menuAlignEl)
                                cmp.menuAlignEl.toggleClass('over', false);
                        });
                    }

                    menu.menuAlignEl = currentTarget;
                    menu.setOffset(-20, -currentTarget.height()/2 - 3);
                    menu.show();
                    _.delay(function() {
                        menu.cmpEl.focus();
                    }, 10);
                    event.stopPropagation();
                    event.preventDefault();
                    return;
                }

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

        onColumnsSelect: function(type, picker, item, record, e){
            var btn = $(e.target);
            if (btn && btn.hasClass('listitem-icon')) {
                this._state.field = {record: record, type: type};
                if (this.fieldsMenu) {
                    if (this.fieldsMenu.isVisible()) {
                        this.fieldsMenu.hide();
                        return;
                    }
                } else {
                    this.miMoveUp = new Common.UI.MenuItem({
                        caption     : this.txtMoveUp,
                        checkable   : false
                    });
                    // this.miMoveUp.on('click', _.bind(this.onMoveUp, this));
                    this.miMoveDown = new Common.UI.MenuItem({
                        caption     : this.txtMoveDown,
                        checkable   : false
                    });
                    // this.miMoveDown.on('click', _.bind(this.onMoveDown, this));
                    this.miMoveBegin = new Common.UI.MenuItem({
                        caption     : this.txtMoveBegin,
                        checkable   : false
                    });
                    // this.miMoveBegin.on('click', _.bind(this.onMoveBegin, this));
                    this.miMoveEnd = new Common.UI.MenuItem({
                        caption     : this.txtMoveEnd,
                        checkable   : false
                    });
                    // this.miMoveEnd.on('click', _.bind(this.onMoveEnd, this));

                    this.miMoveFilter = new Common.UI.MenuItem({
                        caption     : this.txtMoveFilter,
                        checkable   : false
                    });
                    // this.miMoveFilter.on('click', _.bind(this.onMoveFilter, this));
                    this.miMoveRow = new Common.UI.MenuItem({
                        caption     : this.txtMoveRow,
                        checkable   : false
                    });
                    // this.miMoveRow.on('click', _.bind(this.onMoveRow, this));
                    this.miMoveColumn = new Common.UI.MenuItem({
                        caption     : this.txtMoveColumn,
                        checkable   : false
                    });
                    // this.miMoveColumn.on('click', _.bind(this.onMoveColumn, this));
                    this.miMoveValues = new Common.UI.MenuItem({
                        caption     : this.txtMoveValues,
                        checkable   : false
                    });
                    // this.miMoveValues.on('click', _.bind(this.onMoveValues, this));

                    this.miRemove = new Common.UI.MenuItem({
                        caption     : this.txtRemove,
                        checkable   : false
                    });
                    this.miRemove.on('click', _.bind(this.onRemove, this));

                    this.miFieldSettings = new Common.UI.MenuItem({
                        caption     : this.txtFieldSettings,
                        checkable   : false
                    });
                    this.miFieldSettings.on('click', _.bind(this.onFieldSettings, this));

                    this.fieldsMenu = new Common.UI.Menu({
                        menuAlign: 'tr-br',
                        items: [
                            this.miMoveUp,
                            this.miMoveDown,
                            this.miMoveBegin,
                            this.miMoveEnd,
                            {caption     : '--'},
                            this.miMoveFilter,
                            this.miMoveRow,
                            this.miMoveColumn,
                            this.miMoveValues,
                            {caption     : '--'},
                            this.miRemove,
                            {caption     : '--'},
                            this.miFieldSettings
                        ]
                    });
                }

                this.miMoveFilter.setDisabled(type == 3); // menu for filter
                this.miMoveRow.setDisabled(type == 1); // menu for row
                this.miMoveColumn.setDisabled(type == 0); // menu for column
                this.miMoveValues.setDisabled(type == 2); // menu for value

                var recIndex = (record != undefined) ? record.get('index') : -1,
                    len = picker.store.length;
                this.miMoveUp.setDisabled(recIndex<1);
                this.miMoveDown.setDisabled(recIndex>len-2 || recIndex<0);
                this.miMoveBegin.setDisabled(recIndex<1);
                this.miMoveEnd.setDisabled(recIndex>len-2 || recIndex<0);

                this.miFieldSettings.setDisabled(record.get('pivotIndex')==-2);

                var menu = this.fieldsMenu,
                    showPoint, me = this,
                    currentTarget = $(e.currentTarget),
                    parent = $(this.el),
                    offset = currentTarget.offset(),
                    offsetParent = parent.offset();

                showPoint = [offset.left - offsetParent.left + currentTarget.width(), offset.top - offsetParent.top + currentTarget.height()/2];

                var menuContainer = parent.find('#menu-pivot-container');
                if (!menu.rendered) {
                    if (menuContainer.length < 1) {
                        menuContainer = $('<div id="menu-pivot-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id);
                        parent.append(menuContainer);
                    }
                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});

                    menu.on('show:after', function(cmp) {
                        if (cmp && cmp.menuAlignEl)
                            cmp.menuAlignEl.toggleClass('over', true);
                    }).on('hide:after', function(cmp) {
                        if (cmp && cmp.menuAlignEl)
                            cmp.menuAlignEl.toggleClass('over', false);
                    });
                }

                menu.menuAlignEl = currentTarget;
                menu.setOffset(-20, -currentTarget.height()/2 - 3);
                menu.show();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
                e.stopPropagation();
                e.preventDefault();
            }
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        onFieldSettings: function(record, type, e) {
            var me = this;
            var win;
            if (me.api && !this._locked && me._state.field){
                if (me._state.field.type == 2) { // value field
                    var field = me._originalProps.asc_getDataFields()[me._state.field.record.get('index')];
                    (new SSE.Views.ValueFieldSettingsDialog(
                    {
                        props: me._originalProps,
                        field: field,
                        names: me._state.names,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok' && me.api && value) {
                                field.asc_set(me.api, me._originalProps, value);
                            }

                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    })).show();
                } else {
                    (new SSE.Views.FieldSettingsDialog(
                        {
                            props: me._originalProps,
                            fieldIndex: me._state.field.record.get('pivotIndex'),
                            names: me._state.names,
                            api: me.api,
                            type: me._state.field.type,
                            handler: function(result, value) {
                                if (result == 'ok' && me.api && value) {
                                    // me.api.asc_changeFormatTableInfo(me._state.TableName, Asc.c_oAscChangeTableStyleInfo.advancedSettings, value);
                                }

                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        },

        onAddFilter: function() {
            if (this.api && !this._locked && this._state.field){
                this._originalProps.asc_addPageField(this.api, this._state.field.record.get('index'));
            }
        },

        onRemove: function() {
            if (this.api && !this._locked && this._state.field){
                this._originalProps.asc_removeField(this.api, this._state.field.record.get('pivotIndex'));
            }
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
        textAdvanced:   'Show advanced settings',
        txtMoveUp: 'Move Up',
        txtMoveDown: 'Move Down',
        txtMoveBegin: 'Move to Beginning',
        txtMoveEnd: 'Move to End',
        txtMoveFilter: 'Move to Filters',
        txtMoveRow: 'Move to Rows',
        txtMoveColumn: 'Move to Columns',
        txtMoveValues: 'Move to Values',
        txtRemove: 'Remove Field',
        txtFieldSettings: 'Field Settings',
        txtAddFilter: 'Add to Filters',
        txtAddRow: 'Add to Rows',
        txtAddColumn: 'Add to Columns',
        txtAddValues: 'Add to Values'

    }, SSE.Views.PivotSettings || {}));
});