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
 *  ConstraintDialog.js
 *
 *  Created on 09.10.2025
 *
 */

define([], function () { 'use strict';
    SSE.Views.ConstraintDialog = Common.UI.Window.extend(_.extend({
        initialize : function(options) {
            var t = this,
                _options = {};

            _.extend(_options,  {
                title: options.isEdit ? this.txtTitleChange : this.txtTitle,
                cls: 'modal-dlg',
                width: 350,
                height: 'auto',
                buttons: ['ok', { value: 'add', caption: this.txtAdd }, 'cancel']
            }, options);

            this.handler        = options.handler;
            this.constraintOperator = options.constraintOperator;

            this.template = [
                '<div class="box">',
                '<table cols="3" style="width: 100%;">',
                    '<tr style="vertical-align: bottom;">',
                        '<td class="padding-right-10" style="width: 50px;">',
                            '<label>' + this.txtCellRef + '</label>',
                            '<div id="id-dlg-constraint-ref" style="margin-bottom: 10px;"></div>',
                        '</td>',
                        '<td class="padding-right-10" style="width: 50px;">',
                            '<label></label>',
                            '<div id="id-dlg-constraint-operator" style="margin-bottom: 10px;"></div>',
                        '</td>',
                        '<td>',
                            '<label>' + this.txtConstraint + '</label>',
                            '<div id="id-dlg-constraint-constr" style="margin-bottom: 10px; "></div>',
                        '</td>',
                    '</tr>',
                '</table>',
                '</div>'
            ].join('');

            _options.tpl =   _.template(this.template)(_options);
            Common.UI.Window.prototype.initialize.call(this, _options);
        },

        render: function () {
            Common.UI.Window.prototype.render.call(this);

            this.txtCellRef = new Common.UI.InputFieldBtn({
                el          : this.$window.find('#id-dlg-constraint-ref'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true
                // validateOnChange: true
            });
            this.txtCellRef.on('button:click', _.bind(this.onSelectCellRef, this));
            this.txtCellRef.on('changed:after', _.bind(this.onCellRefChanged, this));

            this.txtConstraint = new Common.UI.InputFieldBtn({
                el          : this.$window.find('#id-dlg-constraint-constr'),
                name        : 'range',
                style       : 'width: 100%;',
                btnHint     : this.textSelectData,
                allowBlank  : true
                // validateOnChange: true
            });
            this.txtConstraint.on('button:click', _.bind(this.onSelectConstraint, this));
            this.txtConstraint.on('changed:after', _.bind(this.onConstraintChanged, this));

            this.cmbOperator = new Common.UI.ComboBox({
                el: this.$window.find('#id-dlg-constraint-operator'),
                style: 'width: 100px;',
                menuStyle: 'min-width: 100%;',
                editable: false,
                cls: 'input-group-nr',
                data: [
                    {value: AscCommonExcel.c_oAscOperator['<='], displayValue: this.constraintOperator[AscCommonExcel.c_oAscOperator['<=']]},
                    {value: AscCommonExcel.c_oAscOperator['='], displayValue: this.constraintOperator[AscCommonExcel.c_oAscOperator['=']]},
                    {value: AscCommonExcel.c_oAscOperator['>='], displayValue: this.constraintOperator[AscCommonExcel.c_oAscOperator['>=']]}
                ],
                takeFocusOnClose: true
            });
            this.cmbOperator.setValue(AscCommonExcel.c_oAscOperator['<=']);
            this.cmbOperator.on('selected', _.bind(this.onOperator , this));

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.txtCellRef, this.cmbOperator, this.txtConstraint].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.txtCellRef;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (this.isRangeValid() !== true)
                        return;
                }
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        setSettings: function(settings) {
            if (settings) {
                this.txtCellRef.setValue(settings.cellRef || '');
                this.txtConstraint.setValue(settings.constraint || '');

                var item = this.cmbOperator.store.findWhere({value: settings.operator});
                if (item)
                    this.cmbOperator.setValue(settings.operator);
                else if (this.constraintOperator[settings.operator] !== undefined) {
                    this.cmbOperator.setData([
                        {value: AscCommonExcel.c_oAscOperator['<='], displayValue: this.constraintOperator[AscCommonExcel.c_oAscOperator['<=']]},
                        {value: AscCommonExcel.c_oAscOperator['='], displayValue: this.constraintOperator[AscCommonExcel.c_oAscOperator['=']]},
                        {value: AscCommonExcel.c_oAscOperator['>='], displayValue: this.constraintOperator[AscCommonExcel.c_oAscOperator['>=']]},
                        {value: settings.operator, displayValue: this.constraintOperator[settings.operator]}
                    ]);
                    this.cmbOperator.setValue(settings.operator);
                }
            }
        },

        getSettings: function () {
            return {cellRef: this.txtCellRef.getValue(), operator: this.cmbOperator.getValue(), constraint: this.txtConstraint.getValue()};
        },

        isRangeValid: function() {
            var isvalid = true,
                txtError = '',
                value;
            if (_.isEmpty(this.txtCellRef.getValue())) {
                isvalid = false;
                txtError = this.txtEmpty;
            } else {
                value = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, this.txtCellRef.getValue(), true);
                if (value != Asc.c_oAscError.ID.No) {
                    txtError = ''; // check errors
                    isvalid = false;
                }
            }
            if (!isvalid) {
                this.txtCellRef.showError([txtError]);
                this.txtCellRef.focus();
                return isvalid;
            }

            if (_.isEmpty(this.txtConstraint.getValue())) {
                isvalid = false;
                txtError = this.txtEmpty;
            } else {
                value = this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, this.txtConstraint.getValue(), true);
                if (value != Asc.c_oAscError.ID.No) {
                    txtError = ''; // check errors
                    isvalid = false;
                }
            }
            if (!isvalid) {
                this.txtConstraint.showError([txtError]);
                this.txtConstraint.focus();
                return isvalid;
            }

            return isvalid;
        },

    }, SSE.Views.ConstraintDialog || {}));
});