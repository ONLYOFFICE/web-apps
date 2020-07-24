/*
 *
 * (c) Copyright Ascensio System SIA 2010-2020
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
 *  AutoCorrectDialog.js
 *
 *  Created by Julia Radzhabova on 03.07.2020
 *  Copyright (c) 2020 Ascensio System SIA. All rights reserved.
 *
 */
if (Common === undefined)
    var Common = {};
define([
    'common/main/lib/component/ListView',
    'common/main/lib/component/Window'
], function () { 'use strict';

    Common.Views.AutoCorrectDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 448,
            cls: 'modal-dlg',
            buttons: null
        },

        initialize : function(options) {
            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div id="symbol-table-pnl-special">',
                        '<table cols="1" style="width: 100%;">',
                            '<tr>',
                                '<td style="padding-bottom: 8px;">',
                                    '<label style="font-weight: bold;">' + this.textMathCorrect + '</label>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td>',
                                    '<label style="width: 117px;">' + this.textReplace + '</label>',
                                    '<label>' + this.textBy + '</label>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td>',
                                    '<div id="auto-correct-replace" style="height:22px;width: 115px;margin-right: 2px;display: inline-block;"></div>',
                                    '<div id="auto-correct-by" style="height:22px;width: 299px;display: inline-block;"></div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td style="padding-bottom: 8px;">',
                                    '<div id="auto-correct-math-list" class="" style="width:100%; height: 208px;"></div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td style="padding-bottom: 16px;">',
                                    '<button type="button" class="btn btn-text-default auto" id="auto-correct-btn-reset" style="min-width: 100px;">' + this.textResetAll + '</button>',
                                    '<button type="button" class="btn btn-text-default auto" id="auto-correct-btn-delete" style="min-width: 100px;float: right;">' + this.textDelete + '</button>',
                                    '<button type="button" class="btn btn-text-default auto" id="auto-correct-btn-edit" style="min-width: 100px;float: right;margin-right:5px;">' + this.textAdd+ '</button>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
                '</div>',
                '<div class="separator"></div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.closeButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.mathStore = this.options.mathStore || new Common.UI.DataViewStore();
            this.api = this.options.api;

            var path = this.appPrefix + "settings-math-correct";
            var value = Common.Utils.InternalSettings.get(path + "-add");
            this.arrAdd = value ? JSON.parse(value) : [];
            value = Common.Utils.InternalSettings.get(path + "-rem");
            this.arrRem = value ? JSON.parse(value) : [];

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();
            var me = this;

            this.onInitList();

            // special
            this.mathList = new Common.UI.ListView({
                el: $window.find('#auto-correct-math-list'),
                store: new Common.UI.DataViewStore(this.mathStore.slice(0, 9)),
                simpleAddMode: false,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="pointer-events:none;width: 100%;display:flex;">',
                        '<div style="min-width:110px;padding-right: 5px;<% if (defaultDisabled) { %> font-style:italic; opacity: 0.5;<% } %>"><%= replaced %></div>',
                        '<div style="flex-grow:1;font-family: Cambria Math;font-size:13px;<% if (defaultDisabled) { %> font-style:italic; opacity: 0.5;<% } %>"><%= by %></div>',
                    '</div>'
                ].join('')),
                scrollAlwaysVisible: true
            });
            this.mathList.on('item:select', _.bind(this.onSelectMathItem, this));

            this.inputReplace = new Common.UI.InputField({
                el               : $window.find('#auto-correct-replace'),
                allowBlank       : true,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                var _selectedItem;
                if (value.length) {
                    var store = me.mathList.store;
                    _selectedItem = store.find(function(item) {
                        if ( item.get('replaced').indexOf(value) == 0) {
                            return true;
                        }
                    });
                    if (_selectedItem) {
                        me.mathList.scrollToRecord(_selectedItem, true);
                        if (_selectedItem.get('replaced') == value)
                            me.mathList.selectRecord(_selectedItem, true);
                        else
                            _selectedItem = null;
                    }
                }
                (!_selectedItem) && me.mathList.deselectAll();
                me.updateControls(_selectedItem);
            });

            this.inputReplace.cmpEl.find('input').on('keydown', function(event){
                if (event.key == 'ArrowDown') {
                    var _selectedItem = me.mathList.getSelectedRec() || me.mathList.store.at(0);
                    if (_selectedItem) {
                        me.mathList.selectRecord(_selectedItem);
                        me.mathList.scrollToRecord(_selectedItem);
                    }
                    _.delay(function(){
                        me.mathList.cmpEl.find('.listview').focus();
                    },10);

                }
            });

            this.inputBy = new Common.UI.InputField({
                el               : $window.find('#auto-correct-by'),
                allowBlank       : true,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                me.updateControls();
            });
            // this.inputBy.cmpEl.find('input').css('font-size', '13px');

            this.btnReset = new Common.UI.Button({
                el: $('#auto-correct-btn-reset')
            });
            this.btnReset.on('click', _.bind(this.onResetToDefault, this));

            this.btnEdit = new Common.UI.Button({
                el: $('#auto-correct-btn-edit')
            });
            this.btnEdit.on('click', _.bind(this.onEdit, this, false));

            this.btnDelete = new Common.UI.Button({
                el: $('#auto-correct-btn-delete')
            });
            this.btnDelete.on('click', _.bind(this.onDelete, this, false));

            this.updateControls();

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        onSelectMathItem: function(lisvView, itemView, record) {
            if (record) {
                this.inputReplace.setValue(record.get('replaced'));
                this.inputBy.setValue(record.get('by'));
            }
            this.updateControls(record);
        },

        updateControls: function(rec) {
            if (!this.mathList) return;

            rec = rec || this.mathList.getSelectedRec();
            var inputBy = this.inputBy.getValue();
            if (rec) {
                var disabled = rec.get('defaultDisabled'),
                    defChanged = rec.get('defaultValue') && (rec.get('defaultValueStr')!==rec.get('by'));
                this.btnDelete.setCaption(disabled ? this.textRestore : this.textDelete);
                this.btnEdit.setDisabled(disabled || inputBy === rec.get('by') || !inputBy && !defChanged );
                this.btnEdit.setCaption(!inputBy && defChanged ? this.textReset : this.textEdit);
            } else {
                this.btnDelete.setCaption(this.textDelete);
                this.btnEdit.setDisabled(!inputBy);
                this.btnEdit.setCaption(this.textAdd);
            }
            this.btnDelete.setDisabled(!rec);
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                $('input', me.inputReplace.cmpEl).select().focus();
            },50);

            _.delay(function(){
                me.mathList.setStore(me.mathStore);
                me.mathList.onResetItems();
            },100);
        },

        close: function() {
            Common.UI.Window.prototype.close.apply(this, arguments);
            this.mathList && this.mathList.deselectAll();
        },

        onBtnClick: function(event) {
            this.close();
        },

        onPrimary: function(event) {
            return true;
        },

        onDelete: function() {
            var rec = this.mathList.getSelectedRec();
            if (rec) {
                if (rec.get('defaultValue')) {
                    var path = this.appPrefix + "settings-math-correct-rem";
                    var disabled = !rec.get('defaultDisabled');
                    rec.set('defaultDisabled', disabled);
                    if (disabled)
                        this.arrRem.push(rec.get('replaced'));
                    else
                        this.arrRem.splice(this.arrRem.indexOf(rec.get('replaced')), 1);
                    var val = JSON.stringify(this.arrRem);
                    Common.Utils.InternalSettings.set(path, val);
                    Common.localStorage.setItem(path, val);
                    this.btnDelete.setCaption(disabled ? this.textRestore : this.textDelete);
                } else {
                    this.mathStore.remove(rec);
                }
                this.api.asc_deleteFromAutoCorrectMathSymbols(rec.get('replaced'));
            }
        },

        onEdit: function() {
            var rec = this.mathList.getSelectedRec(),
                by = '';
            if (rec) {
                var idx = _.findIndex(this.arrAdd, function(item){return (item[0]==rec.get('replaced'));});
                if (!this.inputBy.getValue() && rec.get('defaultValue') && (rec.get('defaultValueStr')!==rec.get('by'))) {// reset to default
                    by = rec.get('defaultValue');
                    rec.set('by', rec.get('defaultValueStr'));
                    (idx>=0) && this.arrAdd.splice(idx, 1);
                } else { // replace
                    by = this.inputBy.getValue();
                    rec.set('by', by);
                    if (idx<0)
                        this.arrAdd.push([rec.get('replaced'), by]);
                    else
                        this.arrAdd[idx][1] = by;
                }
            } else {
                rec = this.mathStore.add({
                    replaced: this.inputReplace.getValue(),
                    by: this.inputBy.getValue(),
                    defaultDisabled: false
                });
                this.mathList.selectRecord(rec);
                this.mathList.scrollToRecord(rec);
                by = rec.get('by');
                this.arrAdd.push([rec.get('replaced'), by]);
            }
            var path = this.appPrefix + "settings-math-correct-add";
            var val = JSON.stringify(this.arrAdd);
            Common.Utils.InternalSettings.set(path, val);
            Common.localStorage.setItem(path, val);
            this.api.asc_AddOrEditFromAutoCorrectMathSymbols(rec.get('replaced'), by);
        },

        onResetToDefault: function() {
            this.api.asc_resetToDefaultAutoCorrectMathSymbols();
            this.onResetList();
        },

        onResetList: function() {
            // remove storage data
            var path = this.appPrefix + "settings-math-correct";
            var val = JSON.stringify([]);
            Common.Utils.InternalSettings.set(path + "-add", val);
            Common.localStorage.setItem(path + "-add", val);
            Common.Utils.InternalSettings.set(path + "-rem", val);
            Common.localStorage.setItem(path + "-rem", val);
            this.arrAdd = [];
            this.arrRem = [];

            this.mathStore.remove(this.mathStore.where({defaultValue: undefined}));
            this.mathStore.each(function(item, index){
                item.set('by', item.get('defaultValueStr'));
            });
            this.mathList.deselectAll();
            if (this.mathList.scroller) {
                this.mathList.scroller.update();
                this.mathList.scroller.scrollTop(0);
            }
            this.updateControls();
        },

        onInitList: function() {
            if (this.mathStore.length>0) return;

            this.mathStore.comparator = function(item1, item2) {
                var n1 = item1.get('replaced').toLowerCase(),
                    n2 = item2.get('replaced').toLowerCase();
                if (n1==n2) return 0;
                return (n1<n2) ? -1 : 1;
            };

            var arrAdd = this.arrAdd,
                arrRem = this.arrRem;

            var arr = (this.api) ? this.api.asc_getAutoCorrectMathSymbols() : [],
                data = [];
            _.each(arr, function(item, index){
                var itm = {
                    replaced: item[0],
                    defaultValue: item[1],
                    defaultDisabled: arrRem.indexOf(item[0])>-1
                };
                if (typeof item[1]=='object') {
                    itm.defaultValueStr = '';
                    _.each(item[1], function(ch){
                        itm.defaultValueStr += Common.Utils.String.encodeSurrogateChar(ch);
                    });
                    itm.by = itm.defaultValueStr;
                } else {
                    itm.by = itm.defaultValueStr = Common.Utils.String.encodeSurrogateChar(item[1]);
                }
                data.push(itm);
            });

            var dataAdd = [];
            _.each(arrAdd, function(item, index){
                var idx = _.findIndex(data, {replaced: item[0]});
                if (idx<0) {
                    dataAdd.push({
                        replaced: item[0],
                        by: item[1],
                        defaultDisabled: false
                    });
                } else {
                    var changed = data[idx];
                    changed.by = item[1];
                }
            });
            this.mathStore.reset(data.concat(dataAdd));
            this.updateControls();
        },

        textTitle: 'AutoCorrect',
        textMathCorrect: 'Math AutoCorrect',
        textReplace: 'Replace:',
        textBy: 'By:',
        textResetAll: 'Reset to default',
        textAdd: 'Add',
        textEdit: 'Replace',
        textDelete: 'Delete',
        textRestore: 'Restore',
        textReset: 'Reset'

    }, Common.Views.AutoCorrectDialog || {}))
});
