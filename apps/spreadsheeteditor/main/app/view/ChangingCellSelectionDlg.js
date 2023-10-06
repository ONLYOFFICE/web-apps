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

    SSE.Views.ChangingCellSelectionDlg = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 330,
            height: 220,
            id: 'window-changing-cell'
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
                                            '<label class="input-label" id="changing-cell-label">' + me.textFoundSolution + '</label>',
                                        '</div>',
                                        '<div class="cell-2">',
                                            '<div id="changing-cell-stop" class="padding-small"></div>',
                                            '<div id="changing-cell-pause"></div>',
                                        '</div>',
                                '</div>',
                                '<div class="row-2 padding-small">',
                                    '<div class="cell-1">',
                                        '<label class="input-label">' + me.textTargetValue + '</label>',
                                    '</div>',
                                    '<div class="cell-2">',
                                        '<div id="changing-cell-target-value"></div>',
                                    '</div>',
                                '</div>',
                                '<div class="row-2 padding-small">',
                                    '<div class="cell-1">',
                                        '<label class="input-label">' + me.textCurrenttValue + '</label>',
                                    '</div>',
                                    '<div class="cell-2">',
                                        '<div id="changing-cell-current-value"></div>',
                                    '</div',
                                '</div>',
                            '</div></div>',
                        '</div>',
                    '</div>'
                ].join('')
            }, options);

            this.api        = options.api;
            this.props      = options.props;

            this.options.handler = function(result, value) {
                if ( result != 'ok' || this.isRangeValid() ) {
                    if (options.handler)
                        options.handler.call(this, result, value);
                    return;
                }
                return true;
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.$targetValue = $('#changing-cell-target-value');
            this.$currentValue = $('#changing-cell-current-value');
            this.$formulaSolutionLabel = $('#changing-cell-label');

            this.btnStep = new Common.UI.Button({
                parentEl: $('#changing-cell-stop'),
                caption: this.textStep,
                cls: 'normal dlg-btn'
            });

            this.btnPause = new Common.UI.Button({
                parentEl: $('#changing-cell-pause'),
                caption: this.textPause,
                disabled: true,
                cls: 'normal dlg-btn'
            });
            //this.btnPause.setCaption(status ? this.textPause : this.textContinue);

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
                this.targetValue = props.targetValue;
                this.currentValue = props.currentValue;
                this.iteration = props.iteration;
                this.$targetValue.text(this.targetValue);
                this.$currentValue.text(this.currentValue);
                this.$formulaSolutionLabel.text(Common.Utils.String.format(this.textFoundSolution, props.formulaCell));
            }
        },

        textTitle: 'Changing Cell Selection',
        textFoundSolution: 'The search for the target using cell {0} has found a solution.',
        textTargetValue: 'Target value:',
        textCurrenttValue: 'Current value:',
        textStep: 'Step',
        textPause: 'Pause',
        textContinue: 'Continue'
    }, SSE.Views.ChangingCellSelectionDlg || {}))
});