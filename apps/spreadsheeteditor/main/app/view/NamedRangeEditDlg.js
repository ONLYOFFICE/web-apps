/**
 *
 *  NamedRangeEditDlg.js
 *
 *  Created by Julia.Radzhabova on 27.05.15
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *  
 */

define([
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/component/ComboBox',
    'common/main/lib/component/InputField'
], function () {
    'use strict';

    SSE.Views = SSE.Views || {};

    SSE.Views.NamedRangeEditDlg =  Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            alias: 'NamedRangeEditDlg',
            contentWidth: 380,
            height: 250
        },

        initialize: function (options) {
            var me = this;
            
            _.extend(this.options, {
                title: this.txtTitleNew,
                template: [
                    '<div class="box" style="height:' + (me.options.height - 85) + 'px;">',
                        '<div class="content-panel" style="padding: 0;"><div class="inner-content">',
                            '<div class="settings-panel active">',
                                '<table cols="2" style="width: 100%;">',
                                    '<tr>',
                                        '<td colspan=2 class="padding-small">',
                                            '<label class="header">', me.textName,'</label>',
                                            '<div id="named-range-txt-name" class="input-row" style="width:100%;"></div>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td colspan=2 class="padding-small">',
                                            '<label class="header">', me.textScope,'</label>',
                                            '<div id="named-range-combo-scope" class="input-group-nr" style="width:100%;"></div>',
                                        '</td>',
                                    '</tr>', '<tr>',
                                        '<td colspan=2 >',
                                            '<label class="header">', me.textDataRange, '</label>',
                                        '</td>',
                                    '</tr>',
                                    '<tr>',
                                        '<td class="padding-small">',
                                            '<div id="named-range-txt-range" class="input-row" style="margin-right: 10px;"></div>',
                                        '</td>',
                                        '<td class="padding-small" style="text-align: right;" width="100">',
                                            '<button type="button" class="btn btn-text-default" id="named-range-btn-data" style="min-width: 100px;">', me.textSelectData,'</button>',
                                        '</td>',
                                    '</tr>',
                                '</table>',
                            '</div></div>',
                        '</div>',
                    '</div>',
                    '<div class="separator horizontal"></div>',
                    '<div class="footer center">',
                    '<button class="btn normal dlg-btn primary" result="ok" style="margin-right: 10px;  width: 86px;">' + me.okButtonText + '</button>',
                    '<button class="btn normal dlg-btn" result="cancel" style="width: 86px;">' + me.cancelButtonText + '</button>',
                    '</div>'
                ].join('')
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
                            case c_oAscDefinedNameReason.IsLocked:
                                return me.textIsLocked;
                            break;
                            case c_oAscDefinedNameReason.Existed:
                                return (me.isEdit && me.props.asc_getName().toLowerCase() == value.toLowerCase()) ? true : me.textExistName;
                            case c_oAscDefinedNameReason.NameReserved:
                                return (me.isEdit) ? me.textReservedName : true;
                            default:
                                return me.textInvalidName;
                        }
                    }
                }
            }).on('keypress:after', function(input, e) {
                    if (e.keyCode === Common.UI.Keys.RETURN) {
                       me.onDlgBtnClick('ok');
                    }
                }
            );

            this.cmbScope = new Common.UI.ComboBox({
                el          : $('#named-range-combo-scope'),
                style       : 'width: 100%;',
                menuStyle   : 'min-width: 100%;max-height: 280px;',
                editable    : false,
                cls         : 'input-group-nr',
                data        : []
            });

            this.txtDataRange = new Common.UI.InputField({
                el          : $('#named-range-txt-range'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : true,
                blankError  : this.txtEmpty,
                validateOnChange: true,
                validation  : function(value) {
                    if (_.isEmpty(value)) {
                        return true;
                    }
                    var isvalid = me.api.asc_checkDataRange(c_oAscSelectionDialogType.Chart, value, false);
                    return (isvalid!==c_oAscError.ID.DataRangeError || (me.isEdit && me.props.asc_getRef().toLowerCase() == value.toLowerCase())) ? true : me.textInvalidRange;
                }
            }).on('keypress:after', function(input, e) {
                    if (e.keyCode === Common.UI.Keys.RETURN) {
                       me.onDlgBtnClick('ok');
                    }
                }
            );

            this.btnSelectData = new Common.UI.Button({
                el: $('#named-range-btn-data')
            });
            this.btnSelectData.on('click', _.bind(this.onSelectData, this));
            
            this.afterRender();
        },

        afterRender: function() {
            this._setDefaults(this.props);
            this.setTitle((this.isEdit) ? this.txtTitleEdit : this.txtTitleNew);

            this.api.asc_registerCallback('asc_onLockDefNameManager', this.wrapEvents.onLockDefNameManager);
            this.api.asc_registerCallback('asc_onRefreshDefNameList', this.wrapEvents.onRefreshDefNameList);
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.inputName.cmpEl.find('input').focus();
            },200);
        },

        _setDefaults: function (props) {
            this.cmbScope.setData([{value: -255, displayValue: this.strWorkbook}].concat(this.sheets));

            if (props) {
                var val = props.asc_getScope();
                this.cmbScope.setValue((val===null) ? -255 : val);

                val = props.asc_getName();
                if ( !_.isEmpty(val) ) this.inputName.setValue(val);

                val = props.asc_getRef();
                this.txtDataRange.setValue((val) ? val : '');
                this.dataRangeValid = val;

                this.txtDataRange.setDisabled(this.isEdit && props.asc_getIsTable());
                this.btnSelectData.setDisabled(this.isEdit && props.asc_getIsTable());
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
                });

                var xy = me.$window.offset();
                me.hide();
                win.show(xy.left + 65, xy.top + 77);
                win.setSettings({
                    api     : me.api,
                    range   : (!_.isEmpty(me.txtDataRange.getValue()) && (me.txtDataRange.checkValidate()==true)) ? me.txtDataRange.getValue() : me.dataRangeValid
                });
            }
        },

        getSettings: function() {
            return (new Asc.asc_CDefName(this.inputName.getValue(), this.txtDataRange.getValue(), (this.cmbScope.getValue()==-255) ? null : this.cmbScope.getValue(), this.props.asc_getIsTable()));
        },

        onPrimary: function() {
            return true;
        },

        onDlgBtnClick: function(event) {
            var me = this;
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                if (this.locked) {
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
                    return;
                }
                var checkname = this.inputName.checkValidate(),
                    checkrange = this.txtDataRange.checkValidate();
                if (checkname !== true)  {
                    this.inputName.cmpEl.find('input').focus();
                    return;
                }
                if (checkrange !== true) {
                    this.txtDataRange.cmpEl.find('input').focus();
                    return;
                }
                this.handler && this.handler.call(this, state,  (state == 'ok') ? this.getSettings() : undefined);
            }

            this.close();
        },

        onLockDefNameManager: function(state) {
            this.locked = (state == c_oAscDefinedNameReason.LockDefNameManager);
        },

        onRefreshDefNameList: function(name) {
            var value = Common.localStorage.getItem("sse-settings-coauthmode"),
                me = this;
            if (this.isEdit && (value===null || parseInt(value) == 1)) { // fast co-editing
                if (name && name.asc_getIsLock() && name.asc_getName().toLowerCase() == this.props.asc_getName().toLowerCase() &&
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
        cancelButtonText : 'Cancel',
        okButtonText : 'Ok',
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