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
 *  SparklineTab.js
 *
 *  Created on 15.10.2025
 *
 */

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout'
], function () {
    'use strict';

    SSE.Views.SparklineTab = Common.UI.BaseView.extend(_.extend((function(){
        var template = '<section id="sparkline-design-panel" class="panel" data-tab="sparklinetab" role="tabpanel" aria-labelledby="view">' +
        '</section>';

        function setEvents() {
            var me = this;

            // me.btnChartElements.on('click', function (btn, e) {
            //     me.fireEvent('charttab:updatemenu', [me.menuChartElement.menu]);
            // });
        }

        return {
            initialize: function (options) {
                var controller = SSE.getController('SparklineTab');
                this._state = controller._state;
                Common.UI.BaseView.prototype.initialize.call(this);

                this.lockedControls = [];

                var me = this,
                    _set = Common.enumLock;

                // this.chRatio = new Common.UI.CheckBox({
                //     labelText: 'Constant Proportions',
                //     value: true,
                //     lock        : [_set.lostConnect, _set.editCell],
                //     dataHint    : '1',
                //     dataHintDirection: 'left',
                //     dataHintOffset: 'small'
                // });
                // this.lockedControls.push(this.chRatio);

                Common.UI.LayoutManager.addControls(this.lockedControls);
                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            onCheckStyleChange: function(type, stateName, field, newValue, oldValue, eOpts) {
                var me = this;
                me.fireEvent('tabledesigntab:stylechange', [type, stateName, newValue]);
            },

            render: function (el) {
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                var $host = this.$el;

                // this.btnAdvancedSettings && this.btnAdvancedSettings.render($host.find('#slot-btn-chart-advanced-settings'));
                // $host.find('#slot-lbl-height').text('Height');
                // this.chartStyles.render(this.$el.find('#slot-field-chart-styles'));
                return this.$el;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    // me.btnAdvancedSettings.updateHint('Advanced settings')
                    setEvents.call(me);
                });
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButtons: function(type) {
                return this.lockedControls
            },

            SetDisabled: function (state) {
                this.lockedControls && this.lockedControls.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
            },

            txtRowsCols: 'Rows & Columns',
            tipRowsCols: 'Rows & Columns',
            txtGroupTable_Custom: 'Custom',
            txtGroupTable_Light: 'Light',
            txtGroupTable_Medium: 'Medium',
            txtGroupTable_Dark: 'Dark',
            tipRemDuplicates: 'Removing duplicate lines from a sheet.',
            tipConvertRange: 'Convert this table to a regular range of cells.',
            tipInsertSlicer: 'Insert slicer',
            tipInsertPivot: 'Insert Pivot Table',
            tipHeaderRow: 'Show or hide the header row in a table.',
            tipAltText: 'Set alternative title and description for a table.',
            selectRowText: 'Select row',
            selectColumnText: 'Select entire column',
            selectColumnData: 'Select column data',
            selectTableText: 'Select table',
            insertRowAboveText: 'Insert row above',
            insertRowBelowText: 'Insert row below',
            insertColumnLeftText: 'Insert column left',
            insertColumnRightText: 'Insert column right',
            deleteRowText: 'Delete row',
            deleteColumnText: 'Delete column',
            deleteTableText: 'Delete table',
            txtRemDuplicates: 'Remove duplicates',
            txtConvertToRange: 'Convert to range',
            txtSlicer: 'Slicer',
            txtPivot: 'Pivot',
            txtHeaderRow: 'Header row',
            txtTotalRow: 'Total row',
            txtFirstColumn: 'First column',
            txtLastColumn: 'Last column',
            txtBandedRows: 'Banded rows',
            txtBandedColumns: 'Banded columns',
            txtFilterButton: 'Filter button',
            txtAltText: 'Alt text'
        }
    }()), SSE.Views.SparklineTab || {}));
});
