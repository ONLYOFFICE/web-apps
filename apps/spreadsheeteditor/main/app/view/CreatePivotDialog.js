/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 *  CreatePivotDialog.js
 *
 *  Created by Julia Radzhabova on 04.10.2019
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'common/main/lib/util/utils',
    'common/main/lib/component/InputField',
    'common/main/lib/component/ComboBox',
    'common/main/lib/view/AdvancedSettingsWindow'
], function () { 'use strict';

    SSE.Views.CreatePivotDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 310,
            height: 250
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
                                        '<td style="padding-bottom: 2px;">',
                                            '<label class="input-label">' + me.textDataRange + '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="create-pivot-input-source" class="input-row" style=""></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="input-label">' + me.textDestination + '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div id="create-pivot-radio-new"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div id="create-pivot-radio-exist"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td style="padding-left: 22px;">',
                                            '<div id="create-pivot-input-dest" class="input-row" style=""></div>',
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

            this.dataSourceValid = '';
            this.dataDestValid = '';

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.txtSourceRange = new Common.UI.InputFieldBtn({
                el          : $('#create-pivot-input-source'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true,
                validateOnChange: true
            });
            this.txtSourceRange.on('button:click', _.bind(this.onSelectData, this, 'source'));

            this.txtDestRange = new Common.UI.InputFieldBtn({
                el          : $('#create-pivot-input-dest'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true,
                validateOnChange: true,
                validateOnBlur: false,
                disabled: true
            });
            this.txtDestRange.on('button:click', _.bind(this.onSelectData, this, 'dest'));

            this.radioNew = new Common.UI.RadioBox({
                el: $('#create-pivot-radio-new'),
                labelText: this.textNew,
                name: 'asc-radio-pivot-dest',
                checked: true
            }).on('change', function(field, newValue) {
                me.txtDestRange.setDisabled(newValue);
                me.txtDestRange.showError();
            });

            this.radioExist = new Common.UI.RadioBox({
                el: $('#create-pivot-radio-exist'),
                labelText: this.textExist,
                name: 'asc-radio-pivot-dest'
            }).on('change', function(field, newValue) {
                me.txtDestRange.setDisabled(!newValue);
                me.txtDestRange.cmpEl.find('input').focus();
            });

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.txtSourceRange, this.txtDestRange];
        },

        getDefaultFocusableComponent: function () {
            if (this._alreadyRendered) return; // focus only at first show
            this._alreadyRendered = true;
            return this.txtSourceRange;
        },

        afterRender: function() {
            this._setDefaults(this.props);
        },

        _setDefaults: function (props) {
            if (props) {
                var value = props.asc_getRange();
                this.txtSourceRange.setValue((value) ? value : '');
                this.dataSourceValid = value;

                var me = this;
                this.txtSourceRange.validation = function(value) {
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PivotTableData, value, false);
                    return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                };
                this.txtDestRange.validation = function(value) {
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PivotTableReport, value, false);
                    return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                };
            }
        },

        getSettings: function () {
            var source = this.txtSourceRange.getValue(),
                dest = this.radioExist.getValue() ? this.txtDestRange.getValue() : null;

            return {source: source, destination: dest};
        },

        isRangeValid: function() {
            var isvalid = true,
                txtError = '';

            if (_.isEmpty(this.txtSourceRange.getValue())) {
                isvalid = false;
                txtError = this.txtEmpty;
            } else {
                isvalid = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PivotTableData, this.txtSourceRange.getValue());
                isvalid = (isvalid == Asc.c_oAscError.ID.No);
                !isvalid && (txtError = this.textInvalidRange);
            }
            if (!isvalid) {
                this.txtSourceRange.showError([txtError]);
                this.txtSourceRange.cmpEl.find('input').focus();
                return isvalid;
            }

            if (this.radioExist.getValue()) {
                if (_.isEmpty(this.txtDestRange.getValue())) {
                    isvalid = false;
                    txtError = this.txtEmpty;
                } else {
                    isvalid = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PivotTableReport, this.txtDestRange.getValue());
                    isvalid = (isvalid == Asc.c_oAscError.ID.No);
                    !isvalid && (txtError = this.textInvalidRange);
                }
                if (!isvalid) {
                    this.txtDestRange.showError([txtError]);
                    this.txtDestRange.cmpEl.find('input').focus();
                    return isvalid;
                }
            }

            return isvalid;
        },

        onSelectData: function(type) {
            var me = this,
                txtRange = (type=='source') ? me.txtSourceRange : me.txtDestRange;

            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        var txt = dlg.getSettings();
                        (type=='source') ? (me.dataSourceValid = txt) : (me.dataDestValid = txt);
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
                    range   : (!_.isEmpty(txtRange.getValue()) && (txtRange.checkValidate()==true)) ? txtRange.getValue() : ((type=='source') ? me.dataSourceValid : me.dataDestValid),
                    type    : (type=='source') ? Asc.c_oAscSelectionDialogType.PivotTableData : Asc.c_oAscSelectionDialogType.PivotTableReport
                });
            }
        },

        textTitle: 'Create Pivot Table',
        textDataRange: 'Source data range',
        textSelectData: 'Select data',
        textDestination: 'Choose, where to place the table',
        textNew: 'New worksheet',
        textExist: 'Existing worksheet',
        txtEmpty:           'This field is required',
        textInvalidRange:   'Invalid cells range'
    }, SSE.Views.CreatePivotDialog || {}))
});