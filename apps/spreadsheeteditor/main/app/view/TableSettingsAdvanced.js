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
 *  TableSettingsAdvanced.js
 *
 *  Created on 1/19/17
 *
 */

define([
    'text!spreadsheeteditor/main/app/template/TableSettingsAdvanced.template',
    'common/main/lib/view/AdvancedSettingsWindow',
], function (contentTemplate) {
    'use strict';

    SSE.Views.TableSettingsAdvanced = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 300,
            contentHeight: 257,
            toggleGroup: 'table-adv-settings-group',
            properties: null,
            storageName: 'sse-table-settings-adv-category'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-table-alttext',    panelCaption: this.textAlt}
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);
            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);

            this._originalProps = this.options.tableProps;
            this._changedProps = null;
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            var me = this;

            // Alt Text

            this.inputAltTitle = new Common.UI.InputField({
                el          : $('#table-advanced-alt-title'),
                allowBlank  : true,
                validateOnBlur: false,
                style       : 'width: 100%;'
            }).on('changed:after', function() {
                me.isAltTitleChanged = true;
            });

            this.textareaAltDescription = this.$window.find('textarea');
            this.textareaAltDescription.keydown(function (event) {
                if (event.keyCode == Common.UI.Keys.RETURN) {
                    event.stopPropagation();
                }
                me.isAltDescChanged = true;
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return this.btnsCategory.concat([ this.inputAltTitle, this.textareaAltDescription ]).concat(this.getFooterButtons());  // 0 tab
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);

            var me = this;
            setTimeout(function(){
                switch (index) {
                    case 0:
                        me.inputAltTitle.focus();
                        break;
                }
            }, 10);
        },

        afterRender: function() {
            this._setDefaults(this._originalProps);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        _setDefaults: function(props) {
            if (props ){
                var value = props.asc_getTitle();
                this.inputAltTitle.setValue(value ? value : '');

                value = props.asc_getDescription();
                this.textareaAltDescription.val(value ? value : '');
            }
        },

        getSettings: function() {
            if (this.isAltTitleChanged || this.isAltDescChanged) {
                var info = new Asc.AdvancedTableInfoSettings();
                info.asc_setTitle(this.inputAltTitle.getValue());
                info.asc_setDescription(this.textareaAltDescription.val());
                return info;
            }
        },

        textTitle:      'Table - Advanced Settings',
        textAlt: 'Alternative Text',
        textAltTitle: 'Title',
        textAltDescription: 'Description',
        textAltTip: 'The alternative text-based representation of the visual object information, which will be read to the people with vision or cognitive impairments to help them better understand what information there is in the image, autoshape, chart or table.'

    }, SSE.Views.TableSettingsAdvanced || {}));
});