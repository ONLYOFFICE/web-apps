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
 *  SortOptionsDialog.js
 *
 *  Created on 05.10.2019
 *
 */
define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () { 'use strict';

    SSE.Views.SortOptionsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 230,
            separator: false
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="sort-options-chk-headers"></div>',
                                        '</td>',
                                    '</tr>',
                                    // '<tr>',
                                    //     '<td class="padding-large">',
                                    //         '<div id="sort-options-chk-case"></div>',
                                    //     '</td>',
                                    // '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="input-label">' + me.textOrientation + '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                        '<div id="sort-options-radio-row"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div id="sort-options-radio-col"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.props      = options.props;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);

            this.chHeaders = new Common.UI.CheckBox({
                el: $('#sort-options-chk-headers'),
                labelText: this.textHeaders
            });

            // this.chCase = new Common.UI.CheckBox({
            //     el: $('#sort-options-chk-case'),
            //     labelText: this.textCase
            // });

            this.radioTop = new Common.UI.RadioBox({
                el: $('#sort-options-radio-row'),
                labelText: this.textTopBottom,
                name: 'asc-radio-sort-orient'
            }).on('change', _.bind(function(field, newValue, eOpts) {
                newValue && this.chHeaders.setDisabled(this.props.lockHeaders);
            }, this));

            this.radioLeft = new Common.UI.RadioBox({
                el: $('#sort-options-radio-col'),
                labelText: this.textLeftRight,
                name: 'asc-radio-sort-orient'
            }).on('change', _.bind(function(field, newValue, eOpts) {
                newValue && this.chHeaders.setDisabled(true);
            }, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.chHeaders, this.radioTop, this.radioLeft].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.radioTop;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                this.chHeaders.setValue(props.headers);
                // this.chCase.setValue(props.sensitive);
                (props.sortcol || props.lockOrientation) ? this.radioTop.setValue(true) : this.radioLeft.setValue(true);
                this.radioLeft.setDisabled(props.lockOrientation);
            }
        },

        getSettings: function () {
            return {headers: this.radioTop.getValue() && (this.chHeaders.getValue()=='checked'), /*sensitive: this.chCase.getValue()=='checked',*/ sortcol: this.radioTop.getValue(), lockHeaders: this.props.lockHeaders, lockOrientation: this.props.lockOrientation};
        },

        textTitle: 'Sort Options',
        textHeaders: 'My data has headers',
        textCase: 'Case sensitive',
        textOrientation: 'Orientation',
        textTopBottom: 'Sort top to bottom',
        textLeftRight: 'Sort left to right'

    }, SSE.Views.SortOptionsDialog || {}))
});
