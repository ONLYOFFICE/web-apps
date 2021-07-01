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
define([ 'text!common/main/lib/template/AutoCorrectDialog.template',
    'common/main/lib/component/ListView',
    'common/main/lib/component/Window',
    'common/main/lib/component/CheckBox'
], function (contentTemplate) { 'use strict';
    var _mathStore = new Common.UI.DataViewStore();
    var _functionsStore = new Common.UI.DataViewStore();

    Common.Views.AutoCorrectDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 375,
            height: 430,
            buttons: null,
            toggleGroup: 'autocorrect-dialog-group'
        },

        initialize : function(options) {
            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

            var items = [
                {panelId: 'id-autocorrect-dialog-settings-math',        panelCaption: this.textMathCorrect},
                {panelId: 'id-autocorrect-dialog-settings-recognized',  panelCaption: this.textRecognized}
            ];
            if (this.appPrefix=='de-' || this.appPrefix=='pe-') {
                items.push({panelId: 'id-autocorrect-dialog-settings-de-autoformat',  panelCaption: this.textAutoFormat});
                items.push({panelId: 'id-autocorrect-dialog-settings-autocorrect',  panelCaption: this.textAutoCorrect});

            } else if (this.appPrefix=='sse-')
                items.push({panelId: 'id-autocorrect-dialog-settings-sse-autoformat',  panelCaption: this.textAutoFormat});

            _.extend(this.options, {
                title: this.textTitle,
                storageName: this.appPrefix + 'autocorrect-dialog-category',
                items: items,
                template: [
                    '<div class="box" style="height:' + (this.options.height-85) + 'px;">',
                        '<div class="menu-panel" style="overflow: hidden;">',
                            '<% _.each(items, function(item) { %>',
                            '<button class="btn btn-category" content-target="<%= item.panelId %>"><span class=""><%= item.panelCaption %></span></button>',
                            '<% }); %>',
                        '</div>',
                        '<div class="separator"></div>',
                        '<div class="content-panel">' + _.template(contentTemplate)({scope: this}) + '</div>',
                    '</div>',
                    '<div class="separator horizontal"></div>',
                    '<div class="footer center">',
                        '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.closeButtonText + '</button>',
                    '</div>'
                ].join('')
            }, options || {});

            this.api = this.options.api;

            var path = this.appPrefix + "settings-math-correct";
            var value = Common.Utils.InternalSettings.get(path + "-add");
            this.arrAdd = value ? JSON.parse(value) : [];
            value = Common.Utils.InternalSettings.get(path + "-rem");
            this.arrRem = value ? JSON.parse(value) : [];

            path = this.appPrefix + "settings-rec-functions";
            value = Common.Utils.InternalSettings.get(path + "-add");
            this.arrAddRec = value ? JSON.parse(value) : [];
            value = Common.Utils.InternalSettings.get(path + "-rem");
            this.arrRemRec = value ? JSON.parse(value) : [];
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var $window = this.getChild();
            var me = this;

            // Math correct
            this.chReplaceType = new Common.UI.CheckBox({
                el: $window.findById('#auto-correct-chb-replace-type'),
                labelText: this.textReplaceType,
                value: Common.Utils.InternalSettings.get(this.appPrefix + "settings-math-correct-replace-type")
            }).on('change', function(field, newValue, oldValue, eOpts){
                var checked = (field.getValue()==='checked');
                Common.localStorage.setBool(me.appPrefix + "settings-math-correct-replace-type", checked);
                Common.Utils.InternalSettings.set(me.appPrefix + "settings-math-correct-replace-type", checked);
                me.api.asc_updateFlagAutoCorrectMathSymbols(checked);
            });

            this.onInitList();

            this.mathList = new Common.UI.ListView({
                el: $window.find('#auto-correct-math-list'),
                store: new Common.UI.DataViewStore(_mathStore.slice(0, 9)),
                simpleAddMode: false,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="pointer-events:none;width: 100%;display:flex;">',
                        '<div style="width:110px;padding-right: 5px;overflow: hidden;text-overflow: ellipsis;<% if (defaultDisabled) { %> font-style:italic; opacity: 0.5;<% } %>"><%= replaced %></div>',
                        '<div style="width:230px;overflow: hidden;text-overflow: ellipsis;flex-grow:1;font-family: Cambria Math;font-size:13px;<% if (defaultDisabled) { %> font-style:italic; opacity: 0.5;<% } %>"><%= by %></div>',
                    '</div>'
                ].join('')),
                scrollAlwaysVisible: true,
                tabindex: 1
            });
            this.mathList.on('item:select', _.bind(this.onSelectMathItem, this));

            this.inputReplace = new Common.UI.InputField({
                el               : $window.find('#auto-correct-replace'),
                allowBlank       : true,
                validateOnChange : true,
                maxLength        : 31,
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
                        me.mathList.focus();
                    },10);

                }
            });

            this.inputBy = new Common.UI.InputField({
                el               : $window.find('#auto-correct-by'),
                allowBlank       : true,
                validateOnChange : true,
                maxLength        : 255,
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

            // Recognized functions
            this.onInitRecList();

            this.mathRecList = new Common.UI.ListView({
                el: $window.find('#auto-correct-recognized-list'),
                store: new Common.UI.DataViewStore(_functionsStore.slice(0, 9)),
                simpleAddMode: false,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 340px;text-overflow: ellipsis;overflow: hidden;<% if (defaultDisabled) { %> font-style:italic; opacity: 0.5;<% } %>"><%= value %></div>'
                ].join('')),
                scrollAlwaysVisible: true,
                tabindex: 1
            });
            this.mathRecList.on('item:select', _.bind(this.onSelectRecItem, this));

            this.inputRecFind = new Common.UI.InputField({
                el               : $window.find('#auto-correct-rec-find'),
                allowBlank       : true,
                validateOnChange : true,
                maxLength        : 255,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                var _selectedItem;
                if (value.length) {
                    var store = me.mathRecList.store;
                    _selectedItem = store.find(function(item) {
                        if ( item.get('value').indexOf(value) == 0) {
                            return true;
                        }
                    });
                    if (_selectedItem) {
                        me.mathRecList.scrollToRecord(_selectedItem, true);
                        if (_selectedItem.get('value') == value)
                            me.mathRecList.selectRecord(_selectedItem, true);
                        else
                            _selectedItem = null;
                    }
                }
                (!_selectedItem) && me.mathRecList.deselectAll();
                me.updateRecControls(_selectedItem);
            });

            this.inputRecFind.cmpEl.find('input').on('keydown', function(event){
                if (event.key == 'ArrowDown') {
                    var _selectedItem = me.mathRecList.getSelectedRec() || me.mathRecList.store.at(0);
                    if (_selectedItem) {
                        me.mathRecList.selectRecord(_selectedItem);
                        me.mathRecList.scrollToRecord(_selectedItem);
                    }
                    _.delay(function(){
                        me.mathRecList.focus();
                    },10);

                }
            });

            this.btnResetRec = new Common.UI.Button({
                el: $('#auto-correct-btn-rec-reset')
            });
            this.btnResetRec.on('click', _.bind(this.onResetRecToDefault, this));

            this.btnAddRec = new Common.UI.Button({
                el: $('#auto-correct-btn-rec-edit')
            });
            this.btnAddRec.on('click', _.bind(this.onAddRec, this, false));

            this.btnDeleteRec = new Common.UI.Button({
                el: $('#auto-correct-btn-rec-delete')
            });
            this.btnDeleteRec.on('click', _.bind(this.onDeleteRec, this, false));

            if (this.appPrefix=='de-' || this.appPrefix=='pe-') {
                this.chQuotes = new Common.UI.CheckBox({
                    el: $('#id-autocorrect-dialog-chk-quotes'),
                    labelText: this.textQuotes,
                    value: Common.Utils.InternalSettings.get(this.appPrefix + "settings-autoformat-smart-quotes")
                }).on('change', function(field, newValue, oldValue, eOpts){
                    var checked = (field.getValue()==='checked');
                    Common.localStorage.setBool(me.appPrefix + "settings-autoformat-smart-quotes", checked);
                    Common.Utils.InternalSettings.set(me.appPrefix + "settings-autoformat-smart-quotes", checked);
                    me.api.asc_SetAutoCorrectSmartQuotes(checked);
                });
                this.chHyphens = new Common.UI.CheckBox({
                    el: $('#id-autocorrect-dialog-chk-hyphens'),
                    labelText: this.textHyphens,
                    value: Common.Utils.InternalSettings.get(this.appPrefix + "settings-autoformat-hyphens")
                }).on('change', function(field, newValue, oldValue, eOpts){
                    var checked = (field.getValue()==='checked');
                    Common.localStorage.setBool(me.appPrefix + "settings-autoformat-hyphens", checked);
                    Common.Utils.InternalSettings.set(me.appPrefix + "settings-autoformat-hyphens", checked);
                    me.api.asc_SetAutoCorrectHyphensWithDash(checked);
                });
                this.chBulleted = new Common.UI.CheckBox({
                    el: $('#id-autocorrect-dialog-chk-bulleted'),
                    labelText: this.textBulleted,
                    value: Common.Utils.InternalSettings.get(this.appPrefix + "settings-autoformat-bulleted")
                }).on('change', function(field, newValue, oldValue, eOpts){
                    var checked = (field.getValue()==='checked');
                    Common.localStorage.setBool(me.appPrefix + "settings-autoformat-bulleted", checked);
                    Common.Utils.InternalSettings.set(me.appPrefix + "settings-autoformat-bulleted", checked);
                    me.api.asc_SetAutomaticBulletedLists(checked);
                });
                this.chNumbered = new Common.UI.CheckBox({
                    el: $('#id-autocorrect-dialog-chk-numbered'),
                    labelText: this.textNumbered,
                    value: Common.Utils.InternalSettings.get(this.appPrefix + "settings-autoformat-numbered")
                }).on('change', function(field, newValue, oldValue, eOpts){
                    var checked = (field.getValue()==='checked');
                    Common.localStorage.setBool(me.appPrefix + "settings-autoformat-numbered", checked);
                    Common.Utils.InternalSettings.set(me.appPrefix + "settings-autoformat-numbered", checked);
                    me.api.asc_SetAutomaticNumberedLists(checked);
                });
                // AutoCorrect
                this.chFLSentence = new Common.UI.CheckBox({
                    el: $('#id-autocorrect-dialog-chk-fl-sentence'),
                    labelText: this.textFLSentence,
                    value: Common.Utils.InternalSettings.get(this.appPrefix + "settings-autoformat-fl-sentence")
                }).on('change', function(field, newValue, oldValue, eOpts){
                    var checked = (field.getValue()==='checked');
                    Common.localStorage.setBool(me.appPrefix + "settings-autoformat-fl-sentence", checked);
                    Common.Utils.InternalSettings.set(me.appPrefix + "settings-autoformat-fl-sentence", checked);
                    me.api.asc_SetAutoCorrectFirstLetterOfSentences && me.api.asc_SetAutoCorrectFirstLetterOfSentences(checked);
                });

                this.btnsCategory[3].on('click', _.bind(this.onAutocorrectCategoryClick, this, false));
            } else if (this.appPrefix=='sse-') {
                this.chNewRows = new Common.UI.CheckBox({
                    el: $('#id-autocorrect-dialog-chk-new-rows'),
                    labelText: this.textNewRowCol,
                    value: Common.Utils.InternalSettings.get(this.appPrefix + "settings-autoformat-new-rows")
                }).on('change', function(field, newValue, oldValue, eOpts){
                    var checked = (field.getValue()==='checked');
                    Common.localStorage.setBool(me.appPrefix + "settings-autoformat-new-rows", checked);
                    Common.Utils.InternalSettings.set(me.appPrefix + "settings-autoformat-new-rows", checked);
                    me.api.asc_setIncludeNewRowColTable(checked);
                });

                this.chHyperlink = new Common.UI.CheckBox({
                    el: $('#id-autocorrect-dialog-chk-hyperlink'),
                    labelText: this.textHyperlink,
                    value: Common.Utils.InternalSettings.get(this.appPrefix + "settings-autoformat-hyperlink")
                }).on('change', function(field, newValue, oldValue, eOpts){
                    var checked = (field.getValue()==='checked');
                    Common.localStorage.setBool(me.appPrefix + "settings-autoformat-hyperlink", checked);
                    Common.Utils.InternalSettings.set(me.appPrefix + "settings-autoformat-hyperlink", checked);
                    me.api.asc_setAutoCorrectHyperlinks(checked);
                });
            }

            this.btnsCategory[0].on('click', _.bind(this.onMathCategoryClick, this, false));
            this.btnsCategory[1].on('click', _.bind(this.onRecCategoryClick, this, false));
            this.btnsCategory[2].on('click', _.bind(this.onAutoformatCategoryClick, this, false));

            this.afterRender();
        },

        afterRender: function() {
            this.updateControls();
            this.updateRecControls();
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        getFocusedComponents: function() {
            var arr = [
                    this.chReplaceType, this.inputReplace, this.inputBy, this.mathList, this.btnReset, this.btnEdit, this.btnDelete, // 0 tab
                    this.inputRecFind, this.mathRecList, this.btnResetRec, this.btnAddRec, this.btnDeleteRec, // 1 tab
                    this.chFLSentence // 3 tab
                ];
            arr = arr.concat(this.chNewRows ? [this.chHyperlink, this.chNewRows] : [this.chQuotes, this.chHyphens, this.chBulleted, this.chNumbered]);
            arr = arr.concat(this.chFLSentence ? [this.chFLSentence] : []);
            return arr;
        },

        getSettings: function() {
            return;
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
            var inputBy = this.inputBy.getValue(),
                inputReplace = this.inputReplace.getValue();
            if (rec) {
                var disabled = rec.get('defaultDisabled'),
                    defChanged = rec.get('defaultValue') && (rec.get('defaultValueStr')!==rec.get('by'));
                this.btnDelete.setCaption(disabled ? this.textRestore : this.textDelete);
                this.btnEdit.setDisabled(disabled || inputBy === rec.get('by') && !defChanged || !inputBy || !inputReplace);
                this.btnEdit.setCaption(defChanged && (inputBy === rec.get('by')) ? this.textReset : this.textReplace);
            } else {
                this.btnDelete.setCaption(this.textDelete);
                this.btnEdit.setDisabled(!inputBy || !inputReplace);
                this.btnEdit.setCaption(this.textAdd);
            }
            this.btnDelete.setDisabled(!rec);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);

            var value = this.getActiveCategory();
            if (value==0) this.onMathCategoryClick(true);
            else if (value==1) this.onRecCategoryClick(true);
            else if (value==2) this.onAutoformatCategoryClick(true);
            else if (value==3) this.onAutocorrectCategoryClick(true);
        },

        close: function() {
            Common.Views.AdvancedSettingsWindow.prototype.close.apply(this, arguments);
            this.mathList && this.mathList.deselectAll();
            this.mathRecList && this.mathRecList.deselectAll();
        },

        onMathCategoryClick: function(delay) {
            var me = this;
            _.delay(function(){
                $('input', me.inputReplace.cmpEl).select().focus();
            },delay ? 50 : 0);

            if (me.mathList.store.length < _mathStore.length) {
                _.delay(function(){
                    me.mathList.setStore(_mathStore);
                    me.mathList.onResetItems();
                },delay ? 100 : 10);
            }
        },

        onAutoformatCategoryClick: function(delay) {
            var me = this;
            _.delay(function(){
                me.chHyperlink ? me.chHyperlink.focus() : me.chQuotes.focus();
            },delay ? 50 : 0);
        },

        onAutocorrectCategoryClick: function(delay) {
            var me = this;
            _.delay(function(){
                me.chFLSentence.focus();
            },delay ? 50 : 0);
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
                    disabled ? this.api.asc_deleteFromAutoCorrectMathSymbols(rec.get('replaced')) : this.api.asc_AddOrEditFromAutoCorrectMathSymbols(rec.get('replaced'), rec.get('defaultValue'));
                } else {
                    _mathStore.remove(rec);
                    this.mathList.scroller && this.mathList.scroller.update({});
                    this.api.asc_deleteFromAutoCorrectMathSymbols(rec.get('replaced'));
                }
                this.updateControls();
            }
        },

        onEdit: function() {
            var rec = this.mathList.getSelectedRec(),
                by = '',
                me = this,
                applySettings = function(record, by) {
                    var path = me.appPrefix + "settings-math-correct-add";
                    var val = JSON.stringify(me.arrAdd);
                    Common.Utils.InternalSettings.set(path, val);
                    Common.localStorage.setItem(path, val);
                    me.api.asc_AddOrEditFromAutoCorrectMathSymbols(record.get('replaced'), by);
                    me.mathList.selectRecord(record);
                    me.mathList.scrollToRecord(record);
                };
            if (!rec) {
                rec = _mathStore.findWhere({replaced: this.inputReplace.getValue()})
            }
            if (rec) {
                var idx = _.findIndex(this.arrAdd, function(item){return (item[0]==rec.get('replaced'));});
                var restore = rec.get('defaultValue') && (rec.get('defaultValueStr')!==rec.get('by')) && (this.inputBy.getValue() === rec.get('by'));
                Common.UI.warning({
                    maxwidth: 500,
                    msg: restore ? this.warnRestore.replace('%1', rec.get('replaced')) : this.warnReplace.replace('%1', rec.get('replaced')),
                    buttons: ['yes', 'no'],
                    primary: 'yes',
                    callback: _.bind(function(btn, dontshow){
                        if (btn == 'yes') {
                            if (restore) {// reset to default
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
                            applySettings(rec, by);
                        }
                    }, this)
                });

            } else {
                rec = _mathStore.add({
                    replaced: this.inputReplace.getValue(),
                    by: this.inputBy.getValue(),
                    defaultDisabled: false
                });
                by = rec.get('by');
                this.arrAdd.push([rec.get('replaced'), by]);
                applySettings(rec, by);
            }
        },

        onResetToDefault: function() {
            Common.UI.warning({
                maxwidth: 500,
                msg: this.warnReset,
                buttons: ['yes', 'no'],
                primary: 'yes',
                callback: _.bind(function(btn, dontshow){
                    if (btn == 'yes') {
                        this.api.asc_resetToDefaultAutoCorrectMathSymbols();
                        this.onResetList();
                    }
                }, this)
            });
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

            _mathStore.remove(_mathStore.where({defaultValue: undefined}));
            _mathStore.each(function(item, index){
                item.set('by', item.get('defaultValueStr'));
                item.set('defaultDisabled', false);
            });
            this.mathList.deselectAll();
            if (this.mathList.scroller) {
                this.mathList.scroller.update();
                this.mathList.scroller.scrollTop(0);
            }
            this.updateControls();
        },

        onInitList: function() {
            if (_mathStore.length>0) return;

            _mathStore.comparator = function(item1, item2) {
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
            _mathStore.reset(data.concat(dataAdd));
            this.updateControls();
        },

        onInitRecList: function() {
            if (_functionsStore.length>0) return;

            _functionsStore.comparator = function(item1, item2) {
                var n1 = item1.get('value').toLowerCase(),
                    n2 = item2.get('value').toLowerCase();
                if (n1==n2) return 0;
                return (n1<n2) ? -1 : 1;
            };

            var arrAdd = this.arrAddRec,
                arrRem = this.arrRemRec;

            var arr = (this.api) ? this.api.asc_getAutoCorrectMathFunctions() : [],
                data = [];
            _.each(arr, function(item, index){
                data.push({
                    value: item,
                    defaultValue: true,
                    defaultDisabled: arrRem.indexOf(item)>-1
                });
            });

            var dataAdd = [];
            _.each(arrAdd, function(item, index){
                if (_.findIndex(data, {value: item})<0) {
                    dataAdd.push({
                        value: item,
                        defaultValue: false,
                        defaultDisabled: false
                    });
                }
            });
            _functionsStore.reset(data.concat(dataAdd));
            this.updateRecControls();
        },

        onResetRecToDefault: function() {
            Common.UI.warning({
                maxwidth: 500,
                msg: this.textWarnResetRec,
                buttons: ['yes', 'no'],
                primary: 'yes',
                callback: _.bind(function(btn, dontshow){
                    if (btn == 'yes') {
                        this.api.asc_resetToDefaultAutoCorrectMathFunctions();
                        this.onResetRecList();
                    }
                }, this)
            });
        },

        onResetRecList: function() {
            // remove storage data
            var path = this.appPrefix + "settings-rec-functions";
            var val = JSON.stringify([]);
            Common.Utils.InternalSettings.set(path + "-add", val);
            Common.localStorage.setItem(path + "-add", val);
            Common.Utils.InternalSettings.set(path + "-rem", val);
            Common.localStorage.setItem(path + "-rem", val);
            this.arrAddRec = [];
            this.arrRemRec = [];

            _functionsStore.remove(_functionsStore.where({defaultValue: false}));
            _functionsStore.each(function(item, index){
                item.set('defaultDisabled', false);
            });
            this.mathRecList.deselectAll();
            if (this.mathRecList.scroller) {
                this.mathRecList.scroller.update();
                this.mathRecList.scroller.scrollTop(0);
            }
            this.updateRecControls();
        },

        onRecCategoryClick: function(delay) {
            var me = this;
            _.delay(function(){
                $('input', me.inputRecFind.cmpEl).select().focus();
            },delay ? 50 : 0);

            if (me.mathRecList.store.length < _functionsStore.length) {
                _.delay(function(){
                    me.mathRecList.setStore(_functionsStore);
                    me.mathRecList.onResetItems();
                },delay ? 100 : 10);
            }
        },

        onDeleteRec: function() {
            var rec = this.mathRecList.getSelectedRec();
            if (rec) {
                if (rec.get('defaultValue')) {
                    var path = this.appPrefix + "settings-rec-functions-rem";
                    var disabled = !rec.get('defaultDisabled');
                    rec.set('defaultDisabled', disabled);
                    if (disabled)
                        this.arrRemRec.push(rec.get('value'));
                    else
                        this.arrRemRec.splice(this.arrRemRec.indexOf(rec.get('value')), 1);
                    var val = JSON.stringify(this.arrRemRec);
                    Common.Utils.InternalSettings.set(path, val);
                    Common.localStorage.setItem(path, val);
                    this.btnDeleteRec.setCaption(disabled ? this.textRestore : this.textDelete);
                    disabled ? this.api.asc_deleteFromAutoCorrectMathFunctions(rec.get('value')) : this.api.asc_AddFromAutoCorrectMathFunctions(rec.get('value'));
                } else {
                    _functionsStore.remove(rec);
                    this.mathRecList.scroller && this.mathRecList.scroller.update({});
                    this.api.asc_deleteFromAutoCorrectMathFunctions(rec.get('value'));
                }
                this.updateRecControls();
            }
        },

        onAddRec: function() {
            var rec = this.mathRecList.getSelectedRec(),
                me = this,
                applySettings = function(record) {
                    var path = me.appPrefix + "settings-rec-functions-add";
                    var val = JSON.stringify(me.arrAddRec);
                    Common.Utils.InternalSettings.set(path, val);
                    Common.localStorage.setItem(path, val);
                    me.api.asc_AddFromAutoCorrectMathFunctions(record.get('value'));
                    me.mathRecList.selectRecord(record);
                    me.mathRecList.scrollToRecord(record);
                };
            if (!rec) {
                rec = _functionsStore.findWhere({value: this.inputRecFind.getValue()})
            }
            if (!rec) {
                if (/^[A-Z]+$/i.test(this.inputRecFind.getValue())) {
                    rec = _functionsStore.add({
                        value: this.inputRecFind.getValue(),
                        defaultValue: false,
                        defaultDisabled: false
                    });
                    this.arrAddRec.push(rec.get('value'));
                    applySettings(rec);
                } else
                    Common.UI.warning({
                        maxwidth: 500,
                        msg: this.textWarnAddRec
                    });
            } else {
                me.mathRecList.selectRecord(rec);
                me.mathRecList.scrollToRecord(rec);
            }
        },

        onSelectRecItem: function(lisvView, itemView, record) {
            if (record) {
                this.inputRecFind.setValue(record.get('value'));
            }
            this.updateRecControls(record);
        },

        updateRecControls: function(rec) {
            if (!this.mathRecList) return;

            rec = rec || this.mathRecList.getSelectedRec();
            var value = this.inputRecFind.getValue();

            this.btnDeleteRec.setCaption(rec && rec.get('defaultDisabled') ? this.textRestore : this.textDelete);
            this.btnDeleteRec.setDisabled(!rec);
            this.btnAddRec.setDisabled(!!rec || !value);
        },

        textTitle: 'AutoCorrect',
        textMathCorrect: 'Math AutoCorrect',
        textReplace: 'Replace',
        textBy: 'By',
        textResetAll: 'Reset to default',
        textAdd: 'Add',
        textDelete: 'Delete',
        textRestore: 'Restore',
        textReset: 'Reset',
        textReplaceType: 'Replace text as you type',
        warnReset: 'Any autocorrect you added will be removed and the changed ones will be restored to their original values. Do you want to continue?',
        warnReplace: 'The autocorrect entry for %1 already exists. Do you want to replace it?',
        warnRestore: 'The autocorrect entry for %1 will be reset to its original value. Do you want to continue?',
        textRecognized: 'Recognized Functions',
        textRecognizedDesc: 'The following expressions are recognized math expressions. They will not be automatically italicized.',
        textWarnAddRec: 'Recognized functions must contain only the letters A through Z, uppercase or lowercase.',
        textWarnResetRec: 'Any expression you added will be removed and the removed ones will be restored. Do you want to continue?',
        textAutoFormat: 'AutoFormat As You Type',
        textReplaceText: 'Replace As You Type',
        textApplyText: 'Apply As You Type',
        textQuotes: '"Straight quotes" with "smart quotes"',
        textHyphens: 'Hyphens (--) with dash (—)',
        textBulleted: 'Automatic bulleted lists',
        textNumbered: 'Automatic numbered lists',
        textApplyAsWork: 'Apply as you work',
        textNewRowCol: 'Include new rows and columns in table',
        textAutoCorrect: 'AutoCorrect',
        textFLSentence: 'Capitalize first letter of sentences',
        textHyperlink: 'Internet and network paths with hyperlinks'

    }, Common.Views.AutoCorrectDialog || {}))
});
