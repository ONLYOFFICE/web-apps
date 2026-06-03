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
 *  SolverResultsDlg.js
 *
 *  Created on 11.17.2025
 *
 */
define([], function () { 'use strict';
    SSE.Views.SolverResultsDlg = Common.UI.Window.extend(_.extend({
        options: {
            width: 400,
            header: true,
            style: 'min-width: 400px;',
            cls: 'modal-dlg',
            id: 'window-solver-results-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                '<table cols="1" style="width: 100%;">',
                    '<tr>',
                        '<td style="padding-bottom: 10px;">',
                            '<label id="solver-results-title" class="header" style="display: block;"></label>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td style="padding-bottom: 15px;">',
                            '<label id="solver-results-desc" style="display: block;"></label>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td style="padding-bottom: 10px;">',
                            '<div id="solver-results-radio-keep"></div>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td style="padding-bottom: 30px;">',
                            '<div id="solver-results-radio-restore"></div>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td colspan="2" style="padding-bottom: 10px;">',
                            '<div id="solver-results-chk-params"></div>',
                        '</td>',
                    '</tr>',
                '</table>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this._changedProps = null;
            this._noApply = false;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);
            var $window = this.getChild();

            this.radioKeep = new Common.UI.RadioBox({
                el: $window.find('#solver-results-radio-keep'),
                name: 'asc-radio-solver-keep',
                labelText: this.txtKeep,
                checked: true
            });

            this.radioRestore = new Common.UI.RadioBox({
                el: $window.find('#solver-results-radio-restore'),
                name: 'asc-radio-solver-keep',
                labelText: this.txtRestore
            });

            this.chParams = new Common.UI.CheckBox({
                el: $window.find('#solver-results-chk-params'),
                labelText: this.txtOpenParams,
                value: !!Common.Utils.InternalSettings.get('sse-solver-open-params')
            });

            this.getChild().find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.radioKeep, this.radioRestore, this.chParams].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.radioKeep;
        },

        setSettings: function (id) {
            let title,
                desc;
            switch (id) {
                case AscCommonExcel.c_oAscResultStatus.foundOptimalSolution:
                    title = this.txtOptimalSolution;
                    desc = this.txtOptimalSolutionDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.solutionHasConverged:
                    title = this.txtConverged;
                    desc = this.txtConvergedDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.cannotImproveSolution:
                    title = this.txtCantImprove;
                    desc = this.txtCantImproveDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.objectiveCellNotConverge:
                    title = this.txtNotConverge;
                    desc = this.txtNotConvergeDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.notFindFeasibleSolution:
                    title = this.txtNoFeasible;
                    desc = this.txtNoFeasibleDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.stoppedByUser:
                    title = this.txtStopped;
                    desc = this.txtStoppedDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.linearityConditionsNotSatisfied:
                    title = this.txtLineConditions;
                    desc = this.txtLineConditionsDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.tooLargeProblem:
                    title = this.txtTooLarge;
                    desc = this.txtTooLargeDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.errorValInObjectiveOrConstraintCell:
                    title = this.txtErrorVal;
                    desc = this.txtErrorValDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.notEnoughMemory:
                    title = this.txtNotEnoughMemory;
                    desc = this.txtNotEnoughMemoryDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.errorInModel:
                    title = this.txtErrorModel;
                    desc = this.txtErrorModelDesc;
                    break;
                case AscCommonExcel.c_oAscResultStatus.foundIntegerSolution:
                    title = this.txtIntSolution;
                    desc = this.txtIntSolutionDesc;
                    break;
            }
            title && this.getChild().find('#solver-results-title').text(title);
            desc && this.getChild().find('#solver-results-desc').text(desc);
            this.onAppRepaint();
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state === 'ok') {
                    Common.Utils.InternalSettings.set('sse-solver-open-params', this.chParams.getValue()==='checked');
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        getSettings: function() {
            return {keepSolution: this.radioKeep.getValue(), openParams: this.chParams.getValue()==='checked'};
        },

    }, SSE.Views.SolverResultsDlg || {}))
});