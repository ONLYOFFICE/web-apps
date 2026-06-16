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
 *  InsertTableDialog.js
 *
 *  Created on 2/17/14
 *
 */

if (Common === undefined)
    var Common = {};

define([], function () { 'use strict';

    Common.Views.InsertTableDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 230,
            style: 'min-width: 230px;',
            cls: 'modal-dlg',
            id: 'window-insert-table',
            split: false,
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: (options.split) ? this.txtTitleSplit : this.txtTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<label class="text columns-text" style="width: 130px;">' + this.txtColumns + '</label><div class="columns-val float-right"></div>',
                    '</div>',
                    '<div class="input-row" style="margin-top: 10px;">',
                        '<label class="text rows-text" style="width: 130px;">' + this.txtRows + '</label><div class="rows-val float-right"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.udColumns = new Common.UI.MetricSpinner({
                el          : $window.find('.columns-val'),
                step        : 1,
                width       : 64,
                value       : 2,
                defaultUnit : '',
                maxValue    : 63,
                minValue    : 1,
                allowDecimal: false
            });

            this.udRows = new Common.UI.MetricSpinner({
                el          : $window.find('.rows-val'),
                step        : 1,
                width       : 64,
                value       : 2,
                defaultUnit : '',
                maxValue    : 100,
                minValue    : 1,
                allowDecimal: false
            });
//            this.udColumns.on('entervalue', _.bind(this.onPrimary, this));
//            this.udRows.on('entervalue', _.bind(this.onPrimary, this));
        },

        getFocusedComponents: function() {
            return [this.udColumns, this.udRows].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.udColumns;
        },

        onBtnClick: function(event) {
            if (this.options.handler) {
                this.options.handler.call(this, event.currentTarget.attributes['result'].value, {
                    columns : this.udColumns.getNumberValue(),
                    rows    : this.udRows.getNumberValue()
                });
            }

            this.close();
        },

        onPrimary: function() {
            if (this.options.handler) {
                this.options.handler.call(this, 'ok', {
                    columns : this.udColumns.getNumberValue(),
                    rows    : this.udRows.getNumberValue()
                });
            }

            this.close();
            return false;
        },

        txtTitle: 'Table Size',
        txtTitleSplit: 'Split Cell',
        txtColumns: 'Number of Columns',
        txtRows: 'Number of Rows',
        textInvalidRowsCols: 'You need to specify valid rows and columns count.',
        txtMinText: 'The minimum value for this field is {0}',
        txtMaxText: 'The maximum value for this field is {0}'
    }, Common.Views.InsertTableDialog || {}))
});