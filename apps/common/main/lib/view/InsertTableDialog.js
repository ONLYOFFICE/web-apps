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