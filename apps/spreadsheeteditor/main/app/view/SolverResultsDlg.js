/*
 * (c) Copyright Ascensio System SIA 2010-2025
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