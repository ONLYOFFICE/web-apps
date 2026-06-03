/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
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

            this.helpUrl = null;

            this.pivotInfo = this.api.asc_getCellInfo().asc_getPivotTableInfo();
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
                        '<label><%= scope.txtDescription %> </label>',
                        '<label id="pivot-insert-calculated-help" class="link"><%= scope.txtReadMore %></label>',
                    '</div>'
                ].join(''))({scope: this})
            }, options);

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

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
            this.itemsList.on('entervalue', _.bind(this.onEnterValueItemsList, this));
            this.itemsList.on('item:click', _.bind(this.onClickItemsList, this));
            this.itemsList.on('item:dblclick', _.bind(this.onDblClickItemsList, this));
            this.addTooltipItemsList();

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

            this.$window.find('#pivot-insert-calculated-help').on('click', _.bind(this.showHelp, this));                
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
            return [this.inputName, this.inputFormula, this.itemsList].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.isEdit ? this.inputFormula : this.inputName;
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },


        onEnterValueItemsList: function(listView, record, event) {
            this.onAddItemInFormula(record.get('name'));
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

        addTooltipItemsList: function () {
            var me = this;
            this.itemsList.dataViewItems.forEach(function(itemView) {
                if (itemView.tipsArray) {
                    view.tipsArray.forEach(function(item){
                        item.remove();
                    });
                }
    
                var arr = [],
                    btns = $(itemView.el).find('.list-item-icon');
                btns.tooltip({
                    title: me.txtInsertIntoFormula, 
                    placement: 'cursor',
                    zIndex : me.itemsList.tipZIndex
                });
                btns.each(function(idx, item){
                    arr.push($(item).data('bs.tooltip').tip());
                });
                itemView.tipsArray = arr;
            });
        },

        showHelp: function() {
            if (this.helpUrl==undefined) {
                var lang = Common.Locale.getCurrentLanguage();
                lang = lang ? lang.split(/[\-\_]/)[0] : 'en';

                var me = this,
                    name = '/UsageInstructions/PivotTables.htm',
                    url = 'resources/help/' + lang + name;

                if ( Common.Controllers.Desktop.isActive() ) {
                    if ( Common.Controllers.Desktop.isHelpAvailable() )
                        url = Common.Controllers.Desktop.helpUrl() + name;
                    else {
                        const helpCenter = Common.Utils.InternalSettings.get('url-help-center');
                        if ( helpCenter ) {
                            const _url_obj = new URL(helpCenter);
                            window.open(_url_obj.toString(), '_blank');
                        }

                        me.helpUrl = null;
                        return;
                    }
                }

                fetch(url).then(function(response){
                    if ( response.ok ) {
                        me.helpUrl = url;
                        me.showHelp();
                    } else {
                        url = 'resources/help/' + '{{DEFAULT_LANG}}' + name;
                        fetch(url).then(function(response){
                            if ( response.ok ) {
                                me.helpUrl = url;
                                me.showHelp();
                            } else {
                                me.helpUrl = null;
                            }
                        });
                    }
                });
            } else if (this.helpUrl) {
                window.open(this.helpUrl);
            }
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
        txtInsertIntoFormula: 'Insert into formula'
    }, SSE.Views.PivotInsertCalculatedItemDialog || {}))
});