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
