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
 *  PivotSettings.js
 *
 *  Created on 7/10/17
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/PivotSettings.template',
    'jquery',
    'underscore',
    'backbone'
], function (menuTemplate, $, _, Backbone) {
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
                template: _.template(['<div class="listview inner no-focus" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div>',
                    '<label class="checkbox-indeterminate" style="position:absolute;">',
                        '<input id="pvcheckbox-<%= id %>" type="checkbox" class="button__checkbox">',
                        '<label for="pvcheckbox-<%= id %>" class="checkbox__shape"></label>',
                    '</label>',
                    '<div id="<%= id %>" class="list-item" style="pointer-events:none;"><span style="background-color: transparent;"><%= Common.Utils.String.htmlEncode(value) %></span></div>',
                    '<div class="listitem-icon img-commonctrl"></div>',
                    '</div>'
                ].join(''))
            });
            this.fieldsList.on({
                'item:change': this.onItemChanged.bind(this),
                'item:add': this.onItemChanged.bind(this),
                'item:click': this.onFieldsCheck.bind(this)
            });
            this.fieldsList.$el.on('dragenter', _.bind(this.onDragEnter, this));
            this.fieldsList.$el.on('dragover', _.bind(this.onDragOver, this, this.fieldsList));
            this.fieldsList.$el.on('dragleave', _.bind(this.onDragLeave, this, this.fieldsList));
            this.fieldsList.$el.on('drop', _.bind(this.onDrop, this));
            // this.fieldsList.onKeyDown = _.bind(this.onFieldsListKeyDown, this);
            this.lockedControls.push(this.fieldsList);

            // Sortable.create(this.fieldsList.$el.find('.listview')[0], {});

            var itemTemplate = _.template([
                '<div id="<%= id %>" class="list-item" style="display:inline-block;">',
                '<div style=""><span><%= Common.Utils.String.htmlEncode(value) %></span></div>',
                '<div class="listitem-icon img-commonctrl"></div>',
                '</div>'
            ].join(''));
            this.columnsList = new Common.UI.ListView({
                el: $('#pivot-list-columns'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner no-focus" style=""></div>'].join('')),
                itemTemplate: itemTemplate
            });
            this.columnsList.on('item:click', _.bind(this.onColumnsSelect, this, 0));
            this.columnsList.$el.on('dragenter', _.bind(this.onDragEnter, this));
            this.columnsList.$el.on('dragover', _.bind(this.onDragOver, this, this.columnsList));
            this.columnsList.$el.on('dragleave', _.bind(this.onDragLeave, this, this.columnsList));
            this.columnsList.$el.on('drop', _.bind(this.onDrop, this));
            // this.columnsList.onKeyDown = _.bind(this.onColumnsListKeyDown, this);
            this.lockedControls.push(this.columnsList);

            this.rowsList = new Common.UI.ListView({
                el: $('#pivot-list-rows'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner no-focus" style=""></div>'].join('')),
                itemTemplate: itemTemplate
            });
            this.rowsList.on('item:click', _.bind(this.onColumnsSelect, this, 1));
            this.rowsList.$el.on('dragenter', _.bind(this.onDragEnter, this));
            this.rowsList.$el.on('dragover', _.bind(this.onDragOver, this, this.rowsList));
            this.rowsList.$el.on('dragleave', _.bind(this.onDragLeave, this, this.rowsList));
            this.rowsList.$el.on('drop', _.bind(this.onDrop, this));
            // this.rowsList.onKeyDown = _.bind(this.onRowsListKeyDown, this);
            this.lockedControls.push(this.rowsList);

            this.valuesList = new Common.UI.ListView({
                el: $('#pivot-list-values'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner no-focus" style=""></div>'].join('')),
                itemTemplate: itemTemplate
            });
            this.valuesList.on('item:click', _.bind(this.onColumnsSelect, this, 2));
            this.valuesList.$el.on('dragenter', _.bind(this.onDragEnter, this));
            this.valuesList.$el.on('dragover', _.bind(this.onDragOver, this, this.valuesList));
            this.valuesList.$el.on('dragleave', _.bind(this.onDragLeave, this, this.valuesList));
            this.valuesList.$el.on('drop', _.bind(this.onDrop, this));
            // this.valuesList.onKeyDown = _.bind(this.onValuesListKeyDown, this);
            this.lockedControls.push(this.valuesList);

            this.filtersList = new Common.UI.ListView({
                el: $('#pivot-list-filters'),
                store: new Common.UI.DataViewStore(),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner no-focus" style=""></div>'].join('')),
                itemTemplate: itemTemplate
            });
            this.filtersList.on('item:click', _.bind(this.onColumnsSelect, this,3));
            this.filtersList.$el.on('dragenter', _.bind(this.onDragEnter, this));
            this.filtersList.$el.on('dragover', _.bind(this.onDragOver, this, this.filtersList));
            this.filtersList.$el.on('dragleave', _.bind(this.onDragLeave, this, this.filtersList));
            this.filtersList.$el.on('drop', _.bind(this.onDrop, this));
            // this.filtersList.onKeyDown = _.bind(this.onFiltersListKeyDown, this);
            this.lockedControls.push(this.filtersList);

            $(this.el).on('click', '#pivot-advanced-link', _.bind(this.openAdvancedSettings, this));

            this._initSettings = false;
        },

        getDragElement: function(value) {
            this._dragEl = $('<div style="font-weight: bold;position: absolute;left:-10000px;z-index: 10000;">' + Common.Utils.String.htmlEncode(value) + '</div>');
            $(document.body).append(this._dragEl);
            return this._dragEl[0];
        },

        onDragEnd: function() {
            this._dragEl && this._dragEl.remove();
            this._dragEl = null;
            Common.NotificationCenter.trigger('pivot:dragend', this);
        },

        onFieldsDragStart: function (item, index, event) {
            this._state.field = {record: item.model};
            event.originalEvent.dataTransfer.effectAllowed = 'move';
            !Common.Utils.isIE && event.originalEvent.dataTransfer.setDragImage(this.getDragElement(item.model.get('value')), 14, 14);
            this.pivotIndex = index;
            this.fromListView = this.fieldsList.$el[0].id;
        },

        onItemsDragStart: function (type, listview, item, index, event) {
            this._state.field = {record: item.model, type: type};
            event.originalEvent.dataTransfer.effectAllowed = 'move';
            !Common.Utils.isIE && event.originalEvent.dataTransfer.setDragImage(this.getDragElement(item.model.get('value')), 14, 14);
            this.itemIndex = index;
            this.pivotIndex = listview.store.at(index).attributes.pivotIndex;
            this.fromListView = listview.$el[0].id;
        },

        onDragItemEnter: function (item, index, event) {
            event.preventDefault();
            item.$el.addClass('insert');
            this.indexMoveTo = index;
        },

        onDragItemLeave: function (item, index, event) {
            item.$el.removeClass('insert');
            this.indexMoveTo = undefined;
        },

        onDragItemOver: function (listview, item, index, event) {
            if (this.pivotIndex === -2 && (this.enterListView === 'pivot-list-filters' || this.enterListView === 'pivot-list-values')) {
                event.originalEvent.dataTransfer.dropEffect = 'none';
            } else {
                event.preventDefault(); // Necessary. Allows us to drop.
                event.originalEvent.dataTransfer.dropEffect = 'move';
                item.$el.addClass('insert');
                this.indexMoveTo = index;

                // scroll
                var heightListView = item.$el.parent().height(),
                    positionTopItem = item.$el.position().top,
                    heightItem = item.$el.outerHeight(),
                    scrollTop = item.$el.parent().scrollTop();
                if (positionTopItem < heightItem && scrollTop > 0) {
                    listview.scrollToRecord(listview.store.at((index === 0) ? 0 : index - 1));
                }
                if (positionTopItem > heightListView - heightItem && index < listview.store.length) {
                    listview.scrollToRecord(listview.store.at((index === listview.store.length - 1) ? index : index + 1));
                }

                return false;
            }
        },

        onDragEnter: function (event) {
            this.enterListView = event.currentTarget.id;
        },

        onDragOver: function (listview, event) {
            if (event.originalEvent.dataTransfer.types[0] === 'onlyoffice' || (this.pivotIndex === -2 && (this.enterListView === 'pivot-list-filters' || this.enterListView === 'pivot-list-values')) ||
                (this.fromListView === 'pivot-list-fields' && this.enterListView === 'pivot-list-fields')) {
                event.originalEvent.dataTransfer.dropEffect = 'none';
            } else {
                event.preventDefault(); // Necessary. Allows us to drop.
                event.originalEvent.dataTransfer.dropEffect = 'move';
                listview.$el.find('.item').last().addClass('insert last');
                return false;
            }
        },

        onDragLeave: function (listview, event) {
            listview.$el.find('.item').removeClass('insert last');
        },

        onDrop: function (event) {
            event.stopPropagation(); // Stops some browsers from redirecting.
            this.onDragEnd();
            if (this.fromListView === 'pivot-list-fields' && this.enterListView !== 'pivot-list-fields') { //insert field
                if (_.isNumber(this.pivotIndex)) {
                    switch (this.enterListView) {
                        case 'pivot-list-columns':
                            this.onAddColumn(this.pivotIndex, this.indexMoveTo);
                            break;
                        case 'pivot-list-rows':
                            this.onAddRow(this.pivotIndex, this.indexMoveTo);
                            break;
                        case 'pivot-list-filters':
                            this.onAddFilter(this.pivotIndex, this.indexMoveTo);
                            break;
                        case 'pivot-list-values':
                            this.onAddValues(this.pivotIndex, this.indexMoveTo);
                            break;
                    }
                    this.pivotIndex = undefined;
                    this.indexMoveTo = undefined;
                }
            } else if (this.enterListView === 'pivot-list-fields') { //remove field
                if (_.isNumber(this.pivotIndex)) {
                    if (this.fromListView === 'pivot-list-values' && _.isNumber(this.itemIndex)) {
                        this.onRemove(this.pivotIndex, this.itemIndex);
                    } else {
                        this.onRemove(this.pivotIndex);
                    }
                    this.pivotIndex = undefined;
                }
            } else if (this.fromListView !== this.enterListView) { //move to
                if (_.isNumber(this.itemIndex) && this.enterListView) {
                    switch (this.enterListView) {
                        case 'pivot-list-columns':
                            this.onMoveTo(0, this.pivotIndex, this.indexMoveTo);
                            break;
                        case 'pivot-list-rows':
                            this.onMoveTo(1, this.pivotIndex, this.indexMoveTo);
                            break;
                        case 'pivot-list-filters':
                            this.onMoveTo(3, this.pivotIndex, this.indexMoveTo);
                            break;
                        case 'pivot-list-values':
                            this.onMoveTo(2, this.pivotIndex, this.indexMoveTo);
                            break;
                    }
                    this.itemIndex = undefined;
                    this.indexMoveTo = undefined;
                }
            } else if (this.fromListView === this.enterListView) { //move
                if (_.isNumber(this.itemIndex) && this.enterListView) {
                    if (this.itemIndex !== this.indexMoveTo) {
                        switch (this.enterListView) {
                            case 'pivot-list-columns':
                                this.onMove(0, this.itemIndex, _.isNumber(this.indexMoveTo) ? (this.indexMoveTo !== 0 && this.itemIndex < this.indexMoveTo ? this.indexMoveTo - 1 : this.indexMoveTo)  : this.columnsList.store.length - 1);
                                break;
                            case 'pivot-list-rows':
                                this.onMove(1, this.itemIndex, _.isNumber(this.indexMoveTo) ? (this.indexMoveTo !== 0 && this.itemIndex < this.indexMoveTo ? this.indexMoveTo - 1 : this.indexMoveTo) : this.rowsList.store.length - 1);
                                break;
                            case 'pivot-list-filters':
                                this.onMove(3, this.itemIndex, _.isNumber(this.indexMoveTo) ? (this.indexMoveTo !== 0 && this.itemIndex < this.indexMoveTo ? this.indexMoveTo - 1 : this.indexMoveTo) : this.filtersList.store.length - 1);
                                break;
                            case 'pivot-list-values':
                                this.onMove(2, this.itemIndex, _.isNumber(this.indexMoveTo) ? (this.indexMoveTo !== 0 && this.itemIndex < this.indexMoveTo ? this.indexMoveTo - 1 : this.indexMoveTo) : this.valuesList.store.length - 1);
                                break;
                        }
                    }
                    this.itemIndex = undefined;
                    this.indexMoveTo = undefined;
                }
            }
            $(this.el).find('.item').removeClass('insert last');
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
                                Common.NotificationCenter.trigger('edit:complete', me);
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
                    isChecked = [],
                    cache_names = props.asc_getCacheFields(),
                    pivot_names = props.asc_getPivotFields();

                this._state.names = [];
                pivot_names.forEach(function (item, index) {
                    me._state.names[index] = item.asc_getName() || cache_names[index].asc_getName();
                });

                var fillList = function(propValue, list, eventIndex, getNameFunction) {
                    var arr = [];
                    var models = list.store.models,
                        equalArr = list.store.length === (propValue ? propValue.length : 0);
                    propValue && propValue.forEach(function (item, index) {
                        var pivotIndex = item.asc_getIndex();
                        var name = getNameFunction ? getNameFunction(pivotIndex) : item.asc_getName();
                        if (equalArr) {
                            models[index].set({
                                pivotIndex: pivotIndex,
                                index           : index,
                                value           : name || '',
                                tip             : (name && name.length>10) ? name : ''
                            });
                        } else
                            arr.push(new Common.UI.DataViewModel({
                                selected        : false,
                                allowSelected   : false,
                                pivotIndex      : pivotIndex,
                                index           : index,
                                value           : name || '',
                                tip             : (name && name.length>10) ? name : ''
                            }));
                        isChecked[getNameFunction ? name : me._state.names[pivotIndex]] = true;
                    });
                    if (!equalArr) {
                        list.store.reset(arr);
                        list.scroller.update({minScrollbarLength  : list.minScrollbarLength, alwaysVisibleY: true, suppressScrollX: true});
                        list.dataViewItems.forEach(function (item, index) {
                            item.$el.attr('draggable', true);
                            item.$el.on('dragstart', _.bind(me.onItemsDragStart, me, eventIndex, list, item, index));
                            item.$el.on('dragenter', _.bind(me.onDragItemEnter, me, item, index));
                            item.$el.on('dragleave', _.bind(me.onDragItemLeave, me, item, index));
                            item.$el.on('dragover', _.bind(me.onDragItemOver, me, list, item, index));
                            item.$el.on('drop', _.bind(me.onDrop, me));
                            item.$el.on('dragend', _.bind(me.onDragEnd, me));
                        });
                        list.$el.find('.item').last().css({'margin-bottom': '10px'});
                    }
                };

                var value = props.asc_getColumnFields();
                value && (value = _.filter(value, function(item){
                    var pivotIndex = item.asc_getIndex();
                    return (pivotIndex>-1 || pivotIndex == -2);
                }));
                fillList(value, this.columnsList, 0, function(pivotIndex) {
                    return (pivotIndex>-1) ? me._state.names[pivotIndex] : me.textValues;
                });

                value = props.asc_getRowFields();
                value && (value = _.filter(value, function(item){
                    var pivotIndex = item.asc_getIndex();
                    return (pivotIndex>-1 || pivotIndex == -2);
                }));
                fillList(value, this.rowsList, 1, function(pivotIndex) {
                    return (pivotIndex>-1) ? me._state.names[pivotIndex] : me.textValues;
                });

                value = props.asc_getDataFields();
                value && (value = _.filter(value, function(item){
                    return (item.asc_getIndex()>-1);
                }));
                fillList(value, this.valuesList, 2);

                value = props.asc_getPageFields();
                value && (value = _.filter(value, function(item){
                    return (item.asc_getIndex()>-1);
                }));
                fillList(value, this.filtersList, 3, function(pivotIndex) {
                    return me._state.names[pivotIndex];
                });

                var arr = [];
                var models = this.fieldsList.store.models;
                var equalArr = this.fieldsList.store.length === me._state.names.length;
                me._state.names.forEach(function (item, index) {
                    if (equalArr) {
                        models[index].set({
                            value           : item,
                            index           : index,
                            tip             : (item.length>25) ? item : '',
                            check           : isChecked[item]
                        });
                    } else
                        arr.push(new Common.UI.DataViewModel({
                            selected        : false,
                            allowSelected   : false,
                            value           : item,
                            index           : index,
                            tip             : (item.length>25) ? item : '',
                            check           : isChecked[item]
                        }));
                });
                if (!equalArr) {
                    this.fieldsList.store.reset(arr);
                    this.fieldsList.scroller.update({minScrollbarLength  : this.fieldsList.minScrollbarLength, alwaysVisibleY: true, suppressScrollX: true});
                    this.fieldsList.dataViewItems.forEach(function (item, index) {
                        item.$el.attr('draggable', true);
                        item.$el.on('dragstart', _.bind(me.onFieldsDragStart, me, item, index));
                        item.$el.on('dragend', _.bind(me.onDragEnd, me));
                    });
                }
            }
        },

        onFieldsCheck: function (listView, itemView, record) {
            // if (this.checkCellTrigerBlock)
            //     return;

            var target = '', isLabel = false, bound = null;

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
                        this.miAddRow.on('click', _.bind(this.onAddRow, this));
                        this.miAddColumn = new Common.UI.MenuItem({
                            caption     : this.txtAddColumn,
                            checkable   : false
                        });
                        this.miAddColumn.on('click', _.bind(this.onAddColumn, this));
                        this.miAddValues = new Common.UI.MenuItem({
                            caption     : this.txtAddValues,
                            checkable   : false
                        });
                        this.miAddValues.on('click', _.bind(this.onAddValues, this));

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

                if (isLabel || event.target.className.match('checkbox') && event.target.localName!=='input') {
                    this.updateFieldCheck(listView, record);
                }
            }
        },

        updateFieldCheck: function (listView, record) {
            if (record && listView) {
                // listView.isSuspendEvents = true;

                record.set('check', !record.get('check'));
                if (this.api && !this._locked){
                    if (record.get('check')) {
                        this._originalProps.asc_addField(this.api, record.get('index'));
                    } else {
                        this._originalProps.asc_removeField(this.api, record.get('index'));
                    }
                    Common.NotificationCenter.trigger('edit:complete', this);
                }

                // listView.isSuspendEvents = false;
                listView.scroller.update({minScrollbarLength  : listView.minScrollbarLength, alwaysVisibleY: true, suppressScrollX: true});
            }
        },

        onColumnsSelect: function(type, picker, item, record, e){
            this._state.field = {record: record, type: type, length: picker.store.length};
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
                this.miMoveUp.on('click', _.bind(this.onMoveUp, this));
                this.miMoveDown = new Common.UI.MenuItem({
                    caption     : this.txtMoveDown,
                    checkable   : false
                });
                this.miMoveDown.on('click', _.bind(this.onMoveDown, this));
                this.miMoveBegin = new Common.UI.MenuItem({
                    caption     : this.txtMoveBegin,
                    checkable   : false
                });
                this.miMoveBegin.on('click', _.bind(this.onMoveBegin, this));
                this.miMoveEnd = new Common.UI.MenuItem({
                    caption     : this.txtMoveEnd,
                    checkable   : false
                });
                this.miMoveEnd.on('click', _.bind(this.onMoveEnd, this));

                this.miMoveFilter = new Common.UI.MenuItem({
                    caption     : this.txtMoveFilter,
                    checkable   : false
                });
                this.miMoveFilter.on('click', _.bind(this.onMoveTo, this, 3));
                this.miMoveRow = new Common.UI.MenuItem({
                    caption     : this.txtMoveRow,
                    checkable   : false
                });
                this.miMoveRow.on('click', _.bind(this.onMoveTo, this, 1));
                this.miMoveColumn = new Common.UI.MenuItem({
                    caption     : this.txtMoveColumn,
                    checkable   : false
                });
                this.miMoveColumn.on('click', _.bind(this.onMoveTo, this, 0));
                this.miMoveValues = new Common.UI.MenuItem({
                    caption     : this.txtMoveValues,
                    checkable   : false
                });
                this.miMoveValues.on('click', _.bind(this.onMoveTo, this, 2));

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


            var recIndex = (record != undefined) ? record.get('index') : -1,
                len = picker.store.length,
                pivotIndex = record.get('pivotIndex');
            this.miMoveUp.setDisabled(recIndex<1);
            this.miMoveDown.setDisabled(recIndex>len-2 || recIndex<0);
            this.miMoveBegin.setDisabled(recIndex<1);
            this.miMoveEnd.setDisabled(recIndex>len-2 || recIndex<0);

            this.miMoveFilter.setDisabled(type == 3 || pivotIndex==-2); // menu for filter
            this.miMoveRow.setDisabled(type == 1); // menu for row
            this.miMoveColumn.setDisabled(type == 0); // menu for column
            this.miMoveValues.setDisabled(type == 2 || pivotIndex==-2); // menu for value

            this.miFieldSettings.setDisabled(pivotIndex==-2);

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
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        onFieldSettings: function(record, type, e) {
            var me = this;
            var win;
            if (me.api && !this._locked && me._state.field){
                if (me._state.field.type == 2) { // value field
                    var dataIndex = me._state.field.record.get('index');
                    var field = me._originalProps.asc_getDataFields()[dataIndex];
                    (new SSE.Views.ValueFieldSettingsDialog(
                    {
                        props: me._originalProps,
                        field: field,
                        api: me.api,
                        handler: function(result, value) {
                            if (result == 'ok' && me.api && value) {
                                field.asc_set(me.api, me._originalProps, dataIndex, value);
                                Common.NotificationCenter.trigger('edit:complete', me);
                            }

                            Common.NotificationCenter.trigger('edit:complete', me);
                        }
                    })).show();
                } else {
                    var pivotIndex = me._state.field.record.get('pivotIndex');
                    var pivotField = me._originalProps.asc_getPivotFields()[pivotIndex];
                    (new SSE.Views.FieldSettingsDialog(
                        {
                            props: me._originalProps,
                            fieldIndex: pivotIndex,
                            api: me.api,
                            type: me._state.field.type,
                            handler: function(result, value) {
                                if (result == 'ok' && me.api && value) {
                                    pivotField.asc_set(me.api, me._originalProps, pivotIndex, value);
                                    Common.NotificationCenter.trigger('edit:complete', me);
                                }

                                Common.NotificationCenter.trigger('edit:complete', me);
                            }
                        })).show();
                }
            }
        },

        onAddFilter: function(index, moveTo) {
            if (this.api && !this._locked && this._state.field){
                this._originalProps.asc_addPageField(this.api, _.isNumber(index) ? index : this._state.field.record.get('index'), _.isNumber(moveTo) ? moveTo : undefined);
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        onAddRow: function(index, moveTo) {
            if (this.api && !this._locked && this._state.field){
                this._originalProps.asc_addRowField(this.api, _.isNumber(index) ? index : this._state.field.record.get('index'), _.isNumber(moveTo) ? moveTo : undefined);
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        onAddColumn: function(index, moveTo) {
            if (this.api && !this._locked && this._state.field){
                this._originalProps.asc_addColField(this.api, _.isNumber(index) ? index : this._state.field.record.get('index'), _.isNumber(moveTo) ? moveTo : undefined);
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        onAddValues: function(index, moveTo) {
            if (this.api && !this._locked && this._state.field){
                this._originalProps.asc_addDataField(this.api, _.isNumber(index) ? index : this._state.field.record.get('index'), _.isNumber(moveTo) ? moveTo : undefined);
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        onRemove: function(pivotindex, index) {
            if (this.api && !this._locked && this._state.field){
                if (this._state.field.type==2 || _.isNumber(index)) // value
                    this._originalProps.asc_removeDataField(this.api, _.isNumber(pivotindex) ? pivotindex : this._state.field.record.get('pivotIndex'), _.isNumber(index) ? index : this._state.field.record.get('index'));
                else
                    this._originalProps.asc_removeNoDataField(this.api, _.isNumber(pivotindex) ? pivotindex : this._state.field.record.get('pivotIndex'));
                Common.NotificationCenter.trigger('edit:complete', this);
            }
        },

        onMoveUp: function() {
            if (this.api && !this._locked && this._state.field){
                var index = this._state.field.record.get('index');
                this.onMove(this._state.field.type, index, index-1);
            }
        },

        onMoveDown: function() {
            if (this.api && !this._locked && this._state.field){
                var index = this._state.field.record.get('index');
                this.onMove(this._state.field.type, index, index+1);
            }
        },

        onMoveBegin: function() {
            if (this.api && !this._locked && this._state.field){
                var index = this._state.field.record.get('index');
                this.onMove(this._state.field.type, index, 0);
            }
        },

        onMoveEnd: function() {
            if (this.api && !this._locked && this._state.field){
                var index = this._state.field.record.get('index');
                this.onMove(this._state.field.type, index, this._state.field.length-1);
            }
        },

        onMove: function(type, from, to) {
            switch (type) {
                case 0:
                    this._originalProps.asc_moveColField(this.api, from, to);
                    break;
                case 1:
                    this._originalProps.asc_moveRowField(this.api, from, to);
                    break;
                case 2:
                    this._originalProps.asc_moveDataField(this.api, from, to);
                    break;
                case 3:
                    this._originalProps.asc_movePageField(this.api, from, to);
                    break;
            }
            Common.NotificationCenter.trigger('edit:complete', this);
        },

        onMoveTo: function(type, pivotindex, to) {
            if (this.api && !this._locked && this._state.field){
                var pivotIndex = _.isNumber(pivotindex) ? pivotindex : this._state.field.record.get('pivotIndex'),
                    index = _.isNumber(to) ? to : ((this._state.field.type==2) ? this._state.field.record.get('index') : undefined);
                switch (type) {
                    case 0:
                        this._originalProps.asc_moveToColField(this.api, pivotIndex, index);
                        break;
                    case 1:
                        this._originalProps.asc_moveToRowField(this.api, pivotIndex, index);
                        break;
                    case 2:
                        this._originalProps.asc_moveToDataField(this.api, pivotIndex, index);
                        break;
                    case 3:
                        this._originalProps.asc_moveToPageField(this.api, pivotIndex, index);
                        break;
                }
                Common.NotificationCenter.trigger('edit:complete', this);
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

        onItemChanged: function (view, record) {
            var state = record.model.get('check');
            if ( state == 'indeterminate' )
                $('input[type=checkbox]', record.$el).prop('indeterminate', true);
            else $('input[type=checkbox]', record.$el).prop({checked: state, indeterminate: false});
        },

        textFields:             'Select Fields',
        textValues              : 'Values',
        textRows                : 'Rows',
        textColumns             : 'Columns',
        textFilters             : 'Filters',
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