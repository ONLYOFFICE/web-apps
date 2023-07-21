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
 *  Created by Julia Radzhabova on 21.07.2023
 *  Copyright (c) 2023 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.GoalSeekDlg = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 250,
            height: 230,
            id: 'window-goal-seek'
        },

        initialize : function(options) {
            var me = this;

            _.extend(this.options, {
                title: this.textTitle,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0 10px;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td>',
                                            '<label class="input-label">' + me.textSetCell + '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div id="goal-seek-formula-cell" class="input-row"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td>',
                                            '<label class="input-label">' + me.textToValue + '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div id="goal-seek-expect-val" class="input-row"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td>',
                                            '<label class="input-label">' + me.textChangingCell + '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div id="goal-seek-change-cell" class="input-row"></div>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
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

            this.dataFormulaCellValid = '';
            this.dataChangeCellValid = '';

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtFormulaCell= new Common.UI.InputFieldBtn({
                el          : $('#goal-seek-formula-cell'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true,
                validateOnChange: true
            });
            this.txtFormulaCell.on('button:click', _.bind(this.onSelectData, this, 'formula'));

            this.txtChangeCell = new Common.UI.InputFieldBtn({
                el          : $('#goal-seek-change-cell'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true,
                validateOnChange: true
            });
            this.txtChangeCell.on('button:click', _.bind(this.onSelectData, this, 'change'));

            this.txtExpectVal = new Common.UI.InputField({
                el          : $('#goal-seek-expect-val'),
                allowBlank  : false,
                blankError  : this.txtEmpty,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validation  : function(value) {
                }
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.txtFormulaCell, this.txtExpectVal, this.txtChangeCell];
        },

        getDefaultFocusableComponent: function () {
            if (this._alreadyRendered) return; // focus only at first show
            this._alreadyRendered = true;
            return this.txtFormulaCell;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                var me = this;
                this.txtFormulaCell.validation = function(value) {
                    // var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, value, false);
                    // return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                };
                this.txtChangeCell.validation = function(value) {
                    // var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, value, false);
                    // return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                };
            }
        },

        getSettings: function () {
            return {formulaCell: this.txtFormulaCell.getValue(), changingCell: this.txtChangeCell.getValue(), expectedValue: this.txtExpectVal.getValue()};
        },

        isRangeValid: function() {
            return true;
        },

        onSelectData: function(type) {
            var me = this,
                txtRange = (type=='formula') ? me.txtFormulaCell : me.txtChangeCell;

            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        var txt = dlg.getSettings();
                        (type=='formula') ? (me.dataFormulaCellValid = txt) : (me.dataChangeCellValid = txt);
                        txtRange.setValue(txt);
                        txtRange.checkValidate();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                    _.delay(function(){
                        txtRange.focus();
                    },1);
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 160, xy.top + 125);
                win.setSettings({
                    api     : me.api,
                    range   : (!_.isEmpty(txtRange.getValue()) && (txtRange.checkValidate()==true)) ? txtRange.getValue() : ((type=='formula') ? me.dataFormulaCellValid : me.dataChangeCellValid)
                });
            }
        },

        textTitle: 'Goal Seek',
        textSetCell: 'Set cell',
        textToValue: 'To value',
        textChangingCell: 'By changing cell',
        txtEmpty: 'This field is required',
        textSelectData: 'Select data',
        textInvalidRange:   'Invalid cells range'
    }, SSE.Views.GoalSeekDlg || {}))
});