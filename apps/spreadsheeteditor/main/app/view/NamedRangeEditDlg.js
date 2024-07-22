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
 *
 *  NamedRangeEditDlg.js
 *
 *  Created on 27.05.15
 *  
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.NamedRangeEditDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'NamedRangeEditDlg',
            contentWidth: 380
        },

        initialize: function (options) {
            var me = this;
            
            _.extend(this.options, {
                title: this.txtTitleNew,
                contentStyle: 'padding: 0;',
                contentTemplate: _.template([
                    '<div class="settings-panel active">',
                        '<div class="inner-content">',
                                '<table cols="1" style="width: 100%;">',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="header">', me.textName,'</label>',
                                            '<div id="named-range-txt-name" class="input-row" style="width:100%;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<label class="header">', me.textScope,'</label>',
                                            '<div id="named-range-combo-scope" class="input-group-nr" style="width:100%;"></div>',
                                        '</td>',
                                    '</tr>', '<tr>',
                                        '<td>',
                                            '<label class="header">', me.textDataRange, '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-large">',
                                            '<div id="named-range-txt-range" class="input-row"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>'
                ].join(''))({scope: this})
            }, options);

            this.api        = options.api;
            this.handler    = options.handler;
            this.isEdit     = options.isEdit || false;
            this.sheets     = options.sheets || [];
            this.props      = options.props;

            this.dataRangeValid = '';

            this.wrapEvents = {
                onRefreshDefNameList: _.bind(this.onRefreshDefNameList, this),
                onLockDefNameManager: _.bind(this.onLockDefNameManager, this)
            };

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;

            this.inputName = new Common.UI.InputField({
                el          : $('#named-range-txt-name'),
                allowBlank  : false,
                placeHolder: this.namePlaceholder,
                blankError  : this.txtEmpty,
                validateOnChange: false,
                validateOnBlur: false,
                style       : 'width: 100%;',
                validation  : function(value) {
                    var isvalid = me.api.asc_checkDefinedName(value, (me.cmbScope.getValue()==-255) ? null : me.cmbScope.getValue());
                    if (isvalid.asc_getStatus() === true) return true;
                    else {
                        switch (isvalid.asc_getReason()) {
                            case Asc.c_oAscDefinedNameReason.IsLocked:
                                return me.textIsLocked;
                            break;
                            case Asc.c_oAscDefinedNameReason.Existed:
                                return (me.isEdit && me.props.asc_getName(true).toLowerCase() == value.toLowerCase()) ? true : me.textExistName;
                            case Asc.c_oAscDefinedNameReason.NameReserved:
                                return (me.isEdit) ? me.textReservedName : true;
                            default:
                                return me.textInvalidName;
                        }
                    }
                }
            });
            this.inputName._input.on('input', function (input, value) {
                me.isInputFirstChange && me.inputName.showError();
                me.isInputFirstChange = false;
            });

            this.cmbScope = new Common.UI.ComboBox({
                el          : $('#named-range-combo-scope'),
                style       : 'width: 100%;',
                menuStyle   : 'min-width: 100%;max-height: 280px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : [],
                takeFocusOnClose: true
            });

            this.txtDataRange = new Common.UI.InputFieldBtn({
                el          : $('#named-range-txt-range'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : true,
                btnHint     : this.textSelectData,
                blankError  : this.txtEmpty,
                validateOnChange: true,
                validation  : function(value) {
                    if (_.isEmpty(value)) {
                        return true;
                    }
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, value, false);
                    return (isvalid!==Asc.c_oAscError.ID.DataRangeError || (me.isEdit && me.props.asc_getRef().toLowerCase() == value.toLowerCase())) ? true : me.textInvalidRange;
                }
            });
            this.txtDataRange.on('button:click', _.bind(this.onSelectData, this));

            this.afterRender();
        },

        getFocusedComponents: function() {
            return [this.inputName, this.cmbScope, this.txtDataRange].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            if (this._alreadyRendered) return; // focus only at first show
            this._alreadyRendered = true;
            return this.inputName;
        },

        afterRender: function() {
            this._setDefaults(this.props);
            this.setTitle((this.isEdit) ? this.txtTitleEdit : this.txtTitleNew);

            this.api.asc_registerCallback('asc_onLockDefNameManager', this.wrapEvents.onLockDefNameManager);
            this.api.asc_registerCallback('asc_onRefreshDefNameList', this.wrapEvents.onRefreshDefNameList);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        _setDefaults: function (props) {
            this.cmbScope.setData([{value: -255, displayValue: this.strWorkbook}].concat(this.sheets));

            if (props) {
                var val = props.asc_getScope();
                this.cmbScope.setValue((val===null) ? -255 : val);

                val = props.asc_getName(true);
                if ( !_.isEmpty(val) ) this.inputName.setValue(val);

                val = props.asc_getRef();
                this.txtDataRange.setValue((val) ? val : '');
                this.dataRangeValid = val;

                this.txtDataRange.setDisabled(this.isEdit && (props.asc_getType()===Asc.c_oAscDefNameType.table || props.asc_getType()===Asc.c_oAscDefNameType.slicer));
            } else
                this.cmbScope.setValue(-255);

            this.cmbScope.setDisabled(this.isEdit);
        },

        onSelectData: function() {
            var me = this;
            if (me.api) {
                var handlerDlg = function(dlg, result) {
                    if (result == 'ok') {
                        me.dataRangeValid = dlg.getSettings();
                        me.txtDataRange.setValue(me.dataRangeValid);
                        me.txtDataRange.checkValidate();
                    }
                };

                var win = new SSE.Views.CellRangeDialog({
                    handler: handlerDlg
                }).on('close', function() {
                    me.show();
                    _.delay(function(){
                        me.txtDataRange.focus();
                    },1);
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 65, xy.top + 77);
                win.setSettings({
                    api     : me.api,
                    range   : (!_.isEmpty(me.txtDataRange.getValue()) && (me.txtDataRange.checkValidate()==true)) ? me.txtDataRange.getValue() : me.dataRangeValid,
                    type    : Asc.c_oAscSelectionDialogType.Chart
                });
            }
        },

        getSettings: function() {
            return (new Asc.asc_CDefName(this.inputName.getValue(), this.txtDataRange.getValue(), (this.cmbScope.getValue()==-255) ? null : this.cmbScope.getValue(), this.props.asc_getType(), undefined, undefined, undefined, true));
        },

        onPrimary: function() {
            this.onDlgBtnClick('ok');
            return false;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                if (this.locked) {
                    Common.UI.alert({
                        msg: this.errorCreateDefName,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: function(btn){
                            me.close();
                        }
                    });
                    return;
                }
                var checkname = this.inputName.checkValidate(),
                    checkrange = this.txtDataRange.checkValidate();
                if (checkname !== true)  {
                    this.inputName.focus();
                    this.isInputFirstChange = true;
                    return;
                }
                if (checkrange !== true) {
                    this.txtDataRange.focus();
                    return;
                }
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onLockDefNameManager: function(state) {
            this.locked = (state == Asc.c_oAscDefinedNameReason.LockDefNameManager);
        },

        onRefreshDefNameList: function(name) {
            var me = this;
            if (this.isEdit && Common.Utils.InternalSettings.get("sse-settings-coauthmode")) { // fast co-editing
                if (name && name.asc_getIsLock() && name.asc_getName(true).toLowerCase() == this.props.asc_getName(true).toLowerCase() &&
                    (name.asc_getScope() === null && this.props.asc_getScope() === null || name.asc_getScope().toLowerCase() == this.props.asc_getScope().toLowerCase()) && !this._listRefreshed) {
                    this._listRefreshed = true;
                    Common.UI.alert({
                        closable: false,
                        msg: this.errorCreateDefName,
                        title: this.notcriticalErrorTitle,
                        iconCls: 'warn',
                        buttons: ['ok'],
                        callback: function(btn){
                            me.close();
                        }
                    });
                }
            }
        },

        close: function () {
            this.api.asc_unregisterCallback('asc_onLockDefNameManager', this.wrapEvents.onLockDefNameManager);
            this.api.asc_unregisterCallback('asc_onRefreshDefNameList', this.wrapEvents.onRefreshDefNameList);

            Common.UI.Window.prototype.close.call(this);
        },

        txtTitleNew: 'New Name',
        txtTitleEdit: 'Edit Name',
        textSelectData: 'Select Data',
        textName: 'Name',
        textScope: 'Scope',
        textDataRange: 'Data Range',
        namePlaceholder: 'Defined name',
        strWorkbook: 'Workbook',
        txtEmpty: 'This field is required',
        textInvalidRange: 'ERROR! Invalid cells range',
        textInvalidName: 'ERROR! Invalid range name',
        textExistName: 'ERROR! Range with such a name already exists',
        textIsLocked: 'This element is being edited by another user.',
        errorCreateDefName: 'The existing named ranges cannot be edited and the new ones cannot be created<br>at the moment as some of them are being edited.',
        notcriticalErrorTitle: 'Warning',
        textReservedName: 'The name you are trying to use is already referenced in cell formulas. Please use some other name.'
    }, SSE.Views.NamedRangeEditDlg || {}));
});