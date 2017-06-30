/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  PivotTable.js
 *
 *  View
 *
 *  Created by Julia.Radzhabova on 06.27.17
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    // 'text!spreadsheeteditor/main/app/template/PivotTableSettings.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/ComboDataView',
    'common/main/lib/component/Layout'
], function (menuTemplate) {
    'use strict';

    SSE.Views.PivotTable = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section id="pivot-table-panel" class="panel" data-tab="pivot">' +
                '<div class="group">' +
                    '<span id="slot-btn-add-pivot" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long"/>' +
                '<div class="group">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-header-row"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-header-column"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group">' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-banded-row"></span>' +
                    '</div>' +
                    '<div class="elset">' +
                        '<span class="btn-slot text" id="slot-chk-banded-column"></span>' +
                    '</div>' +
                '</div>' +
                '<div class="group" id="slot-field-pivot-styles" style="width: 347px;">' +
                '</div>' +
            '</section>';

        function setEvents() {
            var me = this;

            this.btnAddPivot.on('click', function (e) {
                me.fireEvent('pivottable:create');
            });

            this.chRowHeader.on('change', function (field, value) {
                me.fireEvent('pivottable:rowscolumns', [0, value]);
            });
            this.chColHeader.on('change', function (field, value) {
                me.fireEvent('pivottable:rowscolumns', [1, value]);
            });
            this.chRowBanded.on('change', function (field, value) {
                me.fireEvent('pivottable:rowscolumns', [2, value]);
            });
            this.chColBanded.on('change', function (field, value) {
                me.fireEvent('pivottable:rowscolumns', [3, value]);
            });

            this.pivotStyles.on('click', function (combo, record) {
                me.fireEvent('pivottable:style', [record]);
            });
            this.pivotStyles.openButton.menu.on('show:after', function () {
                me.pivotStyles.menuPicker.scroller.update({alwaysVisibleY: true});
            });
        }

        return {
            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;
                this.lockedControls = [];

                this.chRowHeader = new Common.UI.CheckBox({
                    labelText: this.textRowHeader
                });
                this.lockedControls.push(this.chRowHeader);

                this.chColHeader = new Common.UI.CheckBox({
                    labelText: this.textColHeader
                });
                this.lockedControls.push(this.chColHeader);

                this.chRowBanded = new Common.UI.CheckBox({
                    labelText: this.textRowBanded
                });
                this.lockedControls.push(this.chRowBanded);

                this.chColBanded = new Common.UI.CheckBox({
                    labelText: this.textColBanded
                });
                this.lockedControls.push(this.chColBanded);

                this.btnAddPivot = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    iconCls: 'btn-ic-docspell',
                    caption: this.txtCreate
                });
                // this.lockedControls.push(this.btnAddPivot);

                this.pivotStyles = new Common.UI.ComboDataView({
                    cls             : 'combo-pivot-template',
                    enableKeyEvents : true,
                    itemWidth       : 61,
                    itemHeight      : 49,
                    menuMaxHeight   : 300
                    // lock            : [_set.editCell, _set.selChart, _set.selChartText, _set.selShape, _set.selShapeText, _set.selImage, _set.lostConnect, _set.coAuth]
                });
                this.lockedControls.push(this.pivotStyles);

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    me.btnAddPivot.updateHint(me.tipCreatePivot);

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                this.chRowHeader.render(this.$el.find('#slot-chk-header-row'));
                this.chColHeader.render(this.$el.find('#slot-chk-header-column'));
                this.chRowBanded.render(this.$el.find('#slot-chk-banded-row'));
                this.chColBanded.render(this.$el.find('#slot-chk-banded-column'));

                this.btnAddPivot.render(this.$el.find('#slot-btn-add-pivot'));
                this.pivotStyles.render(this.$el.find('#slot-field-pivot-styles'));

                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButton: function(type, parent) {
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            txtCreate: 'Insert Table',
            tipCreatePivot: 'Insert Pivot Table',
            textRowHeader: 'Row Headers',
            textColHeader: 'Column Headers',
            textRowBanded: 'Banded Rows',
            textColBanded: 'Banded Columns'
        }
    }()), SSE.Views.PivotTable || {}));
});