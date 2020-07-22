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
                                '<td>',
                                    '<div id="auto-correct-math-list" class="" style="width:100%; height: 254px;"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
                '</div>',
                '<div class="footer center">',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + this.closeButtonText + '</button>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.props = this.options.props || [];

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();
            var me = this;

            // special
            this.mathList = new Common.UI.ListView({
                el: $window.find('#auto-correct-math-list'),
                store: new Common.UI.DataViewStore(this.props.slice(0, 11)),
                simpleAddMode: true,
                template: _.template(['<div class="listview inner" style=""></div>'].join('')),
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="pointer-events:none;width: 100%;display:flex;">',
                        '<div style="min-width:110px;padding-right: 5px;"><%= replaced %></div>',
                        '<div style="flex-grow:1;font-family: Cambria Math;font-size:13px;"><%= by %></div>',
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
                if (value.length) {
                    var store = me.mathList.store;
                    var _selectedItem = store.find(function(item) {
                        if ( item.get('replaced').indexOf(value) == 0) {
                            return true;
                        }
                    });
                    if (_selectedItem) {
                        me.mathList.selectRecord(_selectedItem, true);
                        me.mathList.scrollToRecord(_selectedItem);
                    } else {
                        me.mathList.deselectAll();
                    }
                } else {
                    me.mathList.deselectAll();
                }
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
            });
            // this.inputBy.cmpEl.find('input').css('font-size', '13px');

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        onSelectMathItem: function(lisvView, itemView, record) {
            this.inputReplace.setValue(record.get('replaced'));
            this.inputBy.setValue(record.get('by'));
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                $('input', me.inputReplace.cmpEl).select().focus();
            },100);

            _.delay(function(){
                me.mathList.store.reset(me.props);
            },100);
        },

        onBtnClick: function(event) {
            this.close();
        },

        onPrimary: function(event) {
            return true;
        },

        textTitle: 'AutoCorrect',
        textMathCorrect: 'Math AutoCorrect',
        textReplace: 'Replace:',
        textBy: 'By:'

    }, Common.Views.AutoCorrectDialog || {}))
});
