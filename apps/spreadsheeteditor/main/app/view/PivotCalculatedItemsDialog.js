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
 *  PivotCalculatedItemsDialog.js
 *
 *  Created on 18.11.2024
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.PivotCalculatedItemsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 410,
            contentHeight: 270,
            separator: false,
            buttons: ['close'],
            id: 'pivot-calculated-dialog'
        },

        initialize : function(options) {
            this.api        = options.api;
            this.handlerWarning    = options.handlerWarning;
            this.getWarningMessage = options.getWarningMessage;

            _.extend(this.options, {
                contentStyle: 'padding: 10px 10px 0 10px;',
                contentTemplate: _.template([
                    '<div id="pivot-calculated-btns-group">',
                        '<div>',
                            '<button type="button" class="btn btn-text-default margin-right-8" id="pivot-calculated-btn-new"><%= scope.txtNew %></button>',
                            '<button type="button" class="btn btn-text-default margin-right-8" id="pivot-calculated-btn-duplicate"><%= scope.txtDuplicate %></button>',
                            '<button type="button" class="btn btn-text-default" id="pivot-calculated-btn-edit"><%= scope.txtEdit %></button>',
                        '</div>',
                        '<button type="button" class="btn btn-text-default" id="pivot-calculated-btn-delete"><%= scope.txtDelete %></button>',
                    '</div>',
                    '<div style="position: relative;">',
                        '<div id="pivot-calculated-items-list"></div>',
                    '</div>'
                ].join(''))({scope: this})
            }, options);
            
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            this.btnNew = new Common.UI.Button({
                el: $('#pivot-calculated-btn-new')
            }).on('click', _.bind(this.onEditItem, this, false, false));

            this.btnDuplicate = new Common.UI.Button({
                el: $('#pivot-calculated-btn-duplicate'),
                disabled: true
            }).on('click', _.bind(this.onDuplicateItem, this));

            this.btnEdit = new Common.UI.Button({
                el: $('#pivot-calculated-btn-edit'),
                disabled: true
            }).on('click', _.bind(this.onEditItem, this, true, false));

            this.btnDelete = new Common.UI.Button({
                el: $('#pivot-calculated-btn-delete'),
                disabled: true
            }).on('click', _.bind(this.onDeleteItem, this));


            this.itemsList = new Common.UI.ListView({
                el: $('#pivot-calculated-items-list', this.$window),
                store: new Common.UI.DataViewStore(),
                emptyText: '',
                headers: [
                    {name: this.txtItemsName, width: 135},
                    {name: this.txtFormula},
                ],
                isRTL: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div class="list-item" style="width: 100%;display:inline-block;">',
                        '<div class="calculated-item calculated-item-name"><%= Common.Utils.String.htmlEncode(name) %></div>',
                        '<div class="calculated-item calculated-item-formula"><%= Common.Utils.String.htmlEncode(formula) %></div>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.itemsList.on('item:select', _.bind(this.onSelectItemsList, this));
            this.updateItemsListStore(false);

            if(this.itemsList.store.length) {
                this.itemsList.selectRecord(this.itemsList.store.at(0));
            }
            else {
                setTimeout(function() {
                    me.onEditItem(false, true);
                }, 0);
            }
        },

        getFocusedComponents: function() {
            return [this.btnNew, this.btnDuplicate, this.btnEdit, this.btnDelete, this.itemsList].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.itemsList;
        },

        setSettings: function() {
            this.pivotInfo = this.api.asc_getCellInfo().asc_getPivotTableInfo();
            this.pivotFieldIndex = this.pivotInfo.asc_getFieldIndexByActiveCell();
            this.itemsObject = this.pivotInfo.asc_getItemsObjectWithFormulas(this.pivotFieldIndex);

            var fieldTitle = this.pivotInfo.asc_getCacheFields()[this.pivotFieldIndex].asc_getName();
            this.setTitle(this.txtTitle + " “" + fieldTitle + "“");
        },

        updateItemsListStore: function(isErrorCheck) {
            var error = false; 
            if(isErrorCheck) {
                error = !this.pivotInfo.asc_canChangeCalculatedItemByActiveCell();
                (!error) && (error = this.pivotInfo.asc_hasTablesErrorForCalculatedItems(this.pivotFieldIndex));
            }
            if(error) {
                this.btnNew.setDisabled(true);
                this.btnDuplicate.setDisabled(true);
                this.btnEdit.setDisabled(true);
                this.btnDelete.setDisabled(true);
                this.itemsList.setDisabled(true);
                this.handlerWarning && this.handlerWarning(error);
            } else {
                this.setSettings();
                this.itemsObject = this.pivotInfo.asc_getItemsObjectWithFormulas(this.pivotFieldIndex);
                this.itemsList.store.reset(
                    this.itemsObject.filter(function(el) { 
                        var isValid = !!el.formula;
                        isValid && (el.formula = '= ' + el.formula); 
                        return isValid;
                    })
                );
            }
        },

        generateUniqueName: function(baseName, existingNames) {
            var uniqueName = baseName;

            if (existingNames.indexOf(baseName) !== -1) {
                var index = 1;
                while (existingNames.indexOf(baseName + " (" + index + ")") !== -1) {
                    index++;
                }
                uniqueName = baseName + " (" + index + ")";
            }
        
            return uniqueName;
        },

        selectLastItem: function() {
            var lastItem = this.itemsList.store.at(-1);
            this.itemsList.selectRecord(lastItem);
            this.itemsList.scrollToRecord(lastItem);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        onSelectItemsList: function(lisvView, itemView, record) {
            this.btnDuplicate.setDisabled(false);
            this.btnEdit.setDisabled(false);
            this.btnDelete.setDisabled(false);
        },
        
        onEditItem: function(isEdit, isInitialOpen) {
            var me = this,
                xy = Common.Utils.getOffset(me.$window),
                selectedItem = this.itemsList.getSelectedRec(),
                editableItem;
            
            if(isEdit && selectedItem) {
                editableItem = {
                    item: selectedItem.get('item'),
                    name: selectedItem.get('name'),
                    formula: selectedItem.get('formula')
                };
            }
            
            var winInsert = new SSE.Views.PivotInsertCalculatedItemDialog({
                api: this.api,
                isEdit: isEdit,
                editableItem: editableItem,
                getWarningMessage: this.getWarningMessage,
                handler: function(type, options) {
                    if(type != 'ok') return;

                    if(isEdit) {
                        me.pivotInfo.asc_modifyCalculatedItem(me.api, me.pivotFieldIndex, options.name, options.formula);
                    } else {
                        var uniqueName = me.generateUniqueName(
                            options.name,
                            me.itemsObject.map(function(item) { return item.name })
                        )
                        me.pivotInfo.asc_addCalculatedItem(me.api, me.pivotFieldIndex, uniqueName, options.formula);
                    }
                    me.updateItemsListStore(true);
                }
            }).on('close', function() {
                if(me.itemsList.store.length) {
                    me.show();
                } else {
                    me.close();
                }
                if(isEdit) {
                    me.itemsList.selectRecord(selectedItem);
                } else {
                    me.selectLastItem();
                }
            });
          
            me.hide();
            if(isInitialOpen) {
                winInsert.show();
            } else {
                winInsert.show(xy.left, xy.top);
            }
        },

        onDuplicateItem: function() {
            var selectedItem = this.itemsList.getSelectedRec();
            if(!selectedItem) return;

            var uniqueName = this.generateUniqueName(
                selectedItem.get('name'),
                this.itemsObject.map(function(item) { return item.name })
            );
            var convertedFormula = this.pivotInfo.asc_convertCalculatedFormula(selectedItem.get('formula').replace('=', ''), this.pivotFieldIndex);
            if (typeof convertedFormula === 'number') {
                this.handlerWarning && this.handlerWarning(convertedFormula);
            } else {
                this.pivotInfo.asc_addCalculatedItem(this.api, this.pivotFieldIndex, uniqueName, convertedFormula);
                this.updateItemsListStore(true);
                this.selectLastItem();
            }
        },

        onDeleteItem: function() {
            var selectedItem = this.itemsList.getSelectedRec();
            if(!selectedItem) return;

            var deletedIndex = this.itemsList.store.indexOf(selectedItem);
            this.pivotInfo.asc_removeCalculatedItem(this.api, this.pivotFieldIndex, selectedItem.get('name'));
            this.itemsList.store.remove(selectedItem);

            if(this.itemsList.store.length > 0) {
                var selectedIndex = deletedIndex < this.itemsList.store.length
                    ? deletedIndex
                    : this.itemsList.store.length - 1;
                    this.itemsList.selectByIndex(selectedIndex);
            } else {
                this.btnDuplicate.setDisabled(true);
                this.btnEdit.setDisabled(true);
                this.btnDelete.setDisabled(true);
            }

            this.updateItemsListStore(true);
        },

        txtTitle: 'Calculated Items in',
        txtNew: 'New',
        txtDuplicate: 'Duplicate',
        txtEdit: 'Edit',
        txtDelete: 'Delete',
        txtItemsName: 'Items Name',
        txtFormula: 'Formula'

    }, SSE.Views.PivotCalculatedItemsDialog || {}))
});