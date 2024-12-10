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
 *  CellsAddDialog.js
 *
 *  Created on 06.09.2019
 *
 */

define([], function () { 'use strict';

    DE.Views.CellsAddDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 214,
            header: true,
            style: 'min-width: 214px;',
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div style="margin-bottom: 10px;">',
                        '<div id="table-combo-row-col" class="input-group-nr margin-right-5" style="display: inline-block;"></div>',
                        '<div id="table-spin-row-col" style="display: inline-block;"></div>',
                    '</div>',
                    '<div id="table-radio-before" style="padding-bottom: 8px;"></div>',
                    '<div id="table-radio-after" style="padding-bottom: 8px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.cmbRowCol = new Common.UI.ComboBox({
                el: $('#table-combo-row-col'),
                cls: 'input-group-nr',
                style: 'width: 110px;',
                menuStyle: 'min-width: 110px;',
                editable: false,
                takeFocusOnClose: true,
                scrollAlwaysVisible: true,
                data: [
                    { value: 0, displayValue: this.textRow},
                    { value: 1, displayValue: this.textCol}
                ]
            });
            this.cmbRowCol.setValue(0);
            this.cmbRowCol.on('selected', _.bind(function(combo, record) {
                var row = record.value == 0;
                this.spnCount.setMaxValue(row ? 100 : 64);
                this.spnCount.setValue(this.spnCount.getNumberValue());
                this.radioBefore.setCaption(row ? this.textUp : this.textLeft);
                this.radioAfter.setCaption(row ? this.textDown : this.textRight);
            }, this));

            this.spnCount = new Common.UI.MetricSpinner({
                el: $('#table-spin-row-col'),
                step        : 1,
                width       : 65,
                value       : 1,
                defaultUnit : '',
                maxValue    : 100,
                minValue    : 1,
                allowDecimal: false
            });

            this.radioBefore = new Common.UI.RadioBox({
                el: $('#table-radio-before'),
                labelText: this.textUp,
                name: 'asc-radio-table-cells-add',
                checked: true
            });

            this.radioAfter = new Common.UI.RadioBox({
                el: $('#table-radio-after'),
                labelText: this.textDown,
                name: 'asc-radio-table-cells-add'
            });

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.cmbRowCol, this.spnCount, this.radioBefore, this.radioAfter].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.spnCount;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                this.options.handler.call(this, state, this.getSettings());
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        getSettings: function() {
            var row = this.cmbRowCol.getValue()==0;
            return {row: row, before: this.radioBefore.getValue(), count: this.spnCount.getNumberValue()};
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        textTitle: 'Insert Several',
        textLeft: 'To the left',
        textRight: 'To the right',
        textUp: 'Above the cursor',
        textDown: 'Below the cursor',
        textRow: 'Rows',
        textCol: 'Columns'

    }, DE.Views.CellsAddDialog || {}))
});