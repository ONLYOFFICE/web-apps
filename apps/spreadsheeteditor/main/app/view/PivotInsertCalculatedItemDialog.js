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
 *  PivotInsertCalculatedItemDialog.js
 *
 *  Created on 18.11.2024
 *
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.PivotInsertCalculatedItemDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 290,
            contentHeight: 350,
            separator: false,
            id: 'pivot-insert-calculated-dialog'
        },

        initialize : function(options) {
            var me = this;


            this.api            = options.api;
            this.isEdit         = options.isEdit;
            this.editableItem   = options.editableItem;
            this.handler        = options.handler;
            this.getWarningMessage = options.getWarningMessage;

            this.pivotInfo = this.api.asc_getPivotInfo().pivot;
            this.pivotFieldIndex = this.pivotInfo.asc_getFieldIndexByActiveCell();
            
            var fieldTitle = this.pivotInfo.asc_getCacheFields()[this.pivotFieldIndex].asc_getName();

            _.extend(this.options, {
                title: this.txtTitle + " “" + fieldTitle + "“",
                contentStyle: 'padding: 10px 10px 0 10px;',
                contentTemplate: _.template([
                    '<div class="pivot-insert-calculated-row">',
                        '<label><%= scope.txtItemName %></label>',
                        '<div id="pivot-insert-calculated-input-name"></div>',
                    '</div>',
                    '<div class="pivot-insert-calculated-row">',
                        '<label><%= scope.txtFormula %></label>',
                        '<div id="pivot-insert-calculated-input-formula"></div>',
                    '</div>',
                    '<div class="pivot-insert-calculated-row">',
                        '<label><%= scope.txtItems %></label>',
                        '<div id="pivot-insert-calculated-items-list"></div>',
                    '</div>',
                    '<div id="pivot-insert-calculated-description">',
                        '<%= scope.txtDescription %> ',
                        '<a href="#" target="_blank"><%= scope.txtReadMore %></a>',
                    '</div>'
                ].join(''))({scope: this})
            }, options);

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            this.itemsList = new Common.UI.ListView({
                el: $('#pivot-insert-calculated-items-list'),
                store: new Common.UI.DataViewStore(
                    this.pivotInfo.asc_getItemsObjectWithFormulas(this.pivotFieldIndex)
                ),
                simpleAddMode: false,
                cls: 'dbl-clickable',
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item">',
                        '<div><%=name%></div>',
                        '<div class="list-item-icon toolbar__icon btn-zoomup"></div>',
                    '</div>'
                ].join('')),
                tabindex: 1
            });
            this.itemsList.on('item:click', _.bind(this.onClickItemsList, this));
            this.itemsList.on('item:dblclick', _.bind(this.onDblClickItemsList, this));

            this.inputName = new Common.UI.InputField({
                el : $('#pivot-insert-calculated-input-name'),
                value: this.editableItem ? this.editableItem.name : this.getNewItemName(),
                disabled: !!this.editableItem,
                allowBlank: false,
                validateOnBlur: false,
                hideErrorOnInput: true
            });

            this.inputFormula = new Common.UI.InputField({
                el : $('#pivot-insert-calculated-input-formula'),
                value: this.editableItem ? this.editableItem.formula : '= 0',
                validateOnBlur: false,
                hideErrorOnInput: true
            });
        },

        getNewItemName: function() {
            var indexMax = 0;
            var textTranslate = this.txtItem;
            this.itemsList.store.each(function(item) {
                var itemName = item.get('name');
                if (0 == itemName.indexOf(textTranslate)){
                    var index = parseInt(itemName.substr(textTranslate.length));
                    if (!isNaN(index) && (indexMax < index))
                        indexMax = index;
                }
            });
            indexMax++;
            return textTranslate + ' ' + indexMax;
        },

        getFocusedComponents: function() {
            return [];
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },


        onClickItemsList: function(listView, itemView, record, event) {
            var targetEL = $(event.target);
            if(targetEL.hasClass('list-item-icon')) {
                this.onAddItemInFormula(record.get('name'));
            }
        },

        onDblClickItemsList: function(listView, itemView, record) {
            this.onAddItemInFormula(record.get('name'));
        },

        onAddItemInFormula: function(name) {
            var formulaValue = this.inputFormula.getValue();
            var formulaValueNoSpaces = formulaValue.trim().replaceAll(' ', '');
            if(formulaValueNoSpaces == '=0' || formulaValueNoSpaces == '=' || formulaValueNoSpaces == '') {
                formulaValue = '=';
            }
            formulaValue += ' ' + this.pivotInfo.asc_convertNameToFormula(name);
            this.inputFormula.setValue(formulaValue);
            this.inputFormula.focus();
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;

            if(this.handler) {
                if(state == 'ok') {
                    var returnedItem = {
                        name: this.inputName.getValue(),
                        formula: this.inputFormula.getValue()
                    };

                    // Validate name
                    if(this.inputName.checkValidate() !== true) {
                        this.inputName.focus();
                        return;
                    }

                    // Validate formula
                    var convertedFormula = this.getConvertedFormula(returnedItem.formula);
                    if(convertedFormula.error) {
                        this.inputFormula.showError([this.getWarningMessage(convertedFormula.error)]);
                        this.inputFormula.focus();
                        return;
                    } 

                    returnedItem.formula = convertedFormula.value;
                    this.handler.call(this, state, returnedItem);
                } else {
                    this.handler.call(this, state);
                }
            }
            this.close();
        },

        getConvertedFormula: function(formula) {
            var formulaTrim = formula.trim();
            var convertedFormula; 

            //If there is no equals sign at the beginning, show an error
            if(formulaTrim[0] != '=') {
                convertedFormula = Asc.c_oAscError.ID.PivotItemNameNotFound;
            } else {
                convertedFormula = this.pivotInfo.asc_convertCalculatedFormula(formulaTrim.slice(1), this.pivotFieldIndex);
            }
                
            if (typeof convertedFormula === 'number') {
                return {
                    error: convertedFormula,
                    value: formulaTrim
                };
            } else {
                return {
                    error: null,
                    value: convertedFormula
                };
            }
        },

        txtTitle: 'Insert Calculated Item in',
        txtItemName: 'Item name',
        txtItem: 'Item',
        txtFormula: 'Formula',
        txtItems: 'Items',
        txtDescription: 'You can use Calculated Items for basic calculations between different items within a single field',
        txtReadMore: 'Read more',
    }, SSE.Views.PivotInsertCalculatedItemDialog || {}))
});