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
 *  OptionsDialog.js
 *
 *  Created on 15.10.2020
 *
 */
define([], function () { 'use strict';

    Common.Views.OptionsDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 214,
            header: true,
            style: 'min-width: 214px;',
            cls: 'modal-dlg',
            items: [],
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, options || {});

            this.template = [
                '<div class="box">',
                '<% if (typeof label !== "undefined" && label !=="") { %>',
                    '<label style="margin-bottom: 10px;"><%= label %></label>',
                '<% } %>',
                '<% _.each(items, function(item, index) { %>',
                    '<% if (!item.id) item.id = Common.UI.getId(); %>',
                    '<div id="<%= item.id %>" style="margin-bottom: 10px;"></div>',
                '<% }) %>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.radio = [];

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = me.getChild(),
                items = this.options.items,
                checked = true;
            this.checkedIndex = -1;
            if (items) {
                for (var i=0; i<items.length; i++) {
                    var item = items[i];
                    this.radio.push(new Common.UI.RadioBox({
                        el: $window.find('#' + item.id),
                        labelText: item.caption || '',
                        name: 'asc-radio-opt-dlg',
                        value: item.value,
                        disabled: !!item.disabled,
                        checked: checked && !item.disabled
                    }).on('change', function(field, newValue, eOpts) {
                        if (newValue) {
                            me.currentCell = field.options.value;
                        }
                    }));
                    if ((checked || item.checked)&& !item.disabled) {
                        checked = false;
                        this.checkedIndex = i;
                    }
                }
                if (this.checkedIndex>=0) {
                    this.radio[this.checkedIndex].setValue(true);
                    this.currentCell = this.radio[this.checkedIndex].options.value;
                }
            }
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return this.radio.concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return (this.checkedIndex>=0) ? this.radio[this.checkedIndex] : null;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        getSettings: function() {
            return this.currentCell;
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        }

    }, Common.Views.OptionsDialog || {}))
});