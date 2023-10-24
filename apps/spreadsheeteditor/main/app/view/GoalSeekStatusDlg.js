/*
 * (c) Copyright Ascensio System SIA 2010-2023
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
 *  GoalSeekDlg.js
 *
 *  Created by Julia Svinareva on 5.10.2023
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.GoalSeekStatusDlg = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 330,
            height: 220,
            id: 'window-goal-seek-status'
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 10px;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<div class="row-1 padding-large" style="width: 100%;">',
                                        '<div class="cell-1">',
                                            '<label class="input-label" id="goal-seek-status-label">' + me.textSearchIteration + '</label>',
                                        '</div>',
                                        '<div class="cell-2">',
                                            '<div id="goal-seek-stop" class="padding-small"></div>',
                                            '<div id="goal-seek-pause"></div>',
                                        '</div>',
                                '</div>',
                                '<div class="row-2 padding-small">',
                                    '<div class="cell-1">',
                                        '<label class="input-label">' + me.textTargetValue + '</label>',
                                    '</div>',
                                    '<div class="cell-2">',
                                        '<div id="goal-seek-target-value"></div>',
                                    '</div>',
                                '</div>',
                                '<div class="row-2 padding-small">',
                                    '<div class="cell-1">',
                                        '<label class="input-label">' + me.textCurrentValue + '</label>',
                                    '</div>',
                                    '<div class="cell-2">',
                                        '<div id="goal-seek-current-value"></div>',
                                    '</div',
                                '</div>',
                            '</div></div>',
                        '</div>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.props      = options.props;

            this._state = {
                isPause: false,
                cellName: undefined
            }

            this.options.handler = function(result, value) {
                if (options.handler)
                    options.handler.call(this, result, value);
                return;
            };

            this.api.asc_registerCallback('asc_onGoalSeekStop',_.bind(this.onStopSelection, this));

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.$targetValue = $('#goal-seek-target-value');
            this.$currentValue = $('#goal-seek-current-value');
            this.$statusLabel = $('#goal-seek-status-label');

            this.btnStep = new Common.UI.Button({
                parentEl: $('#goal-seek-stop'),
                caption: this.textStep,
                cls: 'normal dlg-btn',
                disabled: true
            });
            this.btnStep.on('click', _.bind(this.onBtnStep, this));

            this.btnPause = new Common.UI.Button({
                parentEl: $('#goal-seek-pause'),
                caption: this.textPause,
                cls: 'normal dlg-btn'
            });
            this.btnPause.on('click', _.bind(this.onBtnPause, this));

            this.btnOk = this.getChild().find('.primary');
            this.setDisabledOkButton(true);

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.btnStep, this.btnPause];
        },

        getDefaultFocusableComponent: function () {
            if (this._alreadyRendered) return; // focus only at first show
            this._alreadyRendered = true;
            return this.btnStep;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            var me = this;
        },

        setSettings: function (props) {
            if (props) {
                if (this._state.cellName === undefined)
                    this._state.cellName = props.cellName;
                this.$targetValue.text(props.targetValue);
                this.$currentValue.text(props.currentValue);
                this.$statusLabel.text(Common.Utils.String.format(this.textSearchIteration, props.cellName, props.iteration));
            }
        },

        onBtnPause: function () {
            this._state.isPause = !this._state.isPause;
            this.btnPause.setCaption(this._state.isPause ? this.textContinue : this.textPause);
            this.btnStep.setDisabled(!this._state.isPause);
            this._state.isPause ? this.api.asc_PauseGoalSeek() : this.api.asc_ContinueGoalSeek();
        },

        onBtnStep: function () {
            this.api.asc_StepGoalSeek();
        },

        onStopSelection: function (isFound) {
            this.btnPause.setDisabled(true);
            this.btnStep.setDisabled(true);
            this.setDisabledOkButton(false);
            this.$statusLabel.text(Common.Utils.String.format(isFound ? this.textFoundSolution : this.textNotFoundSolution, this._state.cellName));
        },

        setDisabledOkButton: function (disabled) {
            if (disabled !== this.btnOk.hasClass('disabled')) {
                var decorateBtn = function(button) {
                    button.toggleClass('disabled', disabled);
                    (disabled) ? button.attr({disabled: disabled}) : button.removeAttr('disabled');
                };
                decorateBtn(this.btnOk);
            }
        },

        textTitle: 'Goal Seek Status',
        textFoundSolution: 'Goal Seeking with Cell {0} found a solution.',
        textNotFoundSolution: 'Goal Seeking with Cell {0} may not have found a solution.',
        textSearchIteration: 'Goal Seeking with Cell {0} on iteration #{1}.',
        textTargetValue: 'Target value:',
        textCurrentValue: 'Current value:',
        textStep: 'Step',
        textPause: 'Pause',
        textContinue: 'Continue'
    }, SSE.Views.GoalSeekStatusDlg || {}))
});