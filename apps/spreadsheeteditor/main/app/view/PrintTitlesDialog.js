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
 *  PrintTitlesDialog.js
 *
 *  Created on 17.03.2020
 *
 */
define([], function () { 'use strict';

    SSE.Views.PrintTitlesDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 300,
            header: true,
            style: 'min-width: 216px;',
            cls: 'modal-dlg',
            id: 'window-page-margins',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle
            }, options || {});

            this.template = [
                '<div class="box">',
                '<table cols="2" style="width: 100%;margin-bottom: 10px;">',
                    '<tr>',
                        '<td colspan="2" class="padding-right-10">',
                            '<label class="input-label">' + this.textTop + '</label>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td class="padding-right-10" style="padding-bottom: 16px;">',
                            '<div id="print-titles-txt-top"></div>',
                        '</td>',
                        '<td style="padding-bottom: 16px;">',
                            '<div id="print-titles-presets-top"></div>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td colspan="2" class="padding-right-10">',
                            '<label class="input-label">' + this.textLeft + '</label>',
                        '</td>',
                    '</tr>',
                    '<tr>',
                        '<td class="padding-right-10">',
                            '<div id="print-titles-txt-left"></div>',
                        '</td>',
                        '<td>',
                            '<div id="print-titles-presets-left"></div>',
                        '</td>',
                    '</tr>',
                '</table>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.api = this.options.api;
            this.sheet = this.options.sheet;
            Common.UI.Window.prototype.initialize.call(this, this.options);
            this.dataRangeTop = '';
            this.dataRangeLeft = '';
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this;

            this.txtRangeTop = new Common.UI.InputFieldBtn({
                el          : $('#print-titles-txt-top'),
                style       : 'width: 100%;',
                btnHint     : this.textSelectRange,
                allowBlank  : true,
                validateOnChange: true,
                validation  : function(value) {
                    if (_.isEmpty(value)) {
                        return true;
                    }
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PrintTitles, value, false);
                    return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                }
            });

            var frozen = this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.frozen, false, this.sheet);
            this.btnPresetsTop = new Common.UI.Button({
                parentEl: $('#print-titles-presets-top'),
                cls: 'btn-text-menu-default',
                caption: this.textRepeat,
                style: 'width: 95px;',
                menu: new Common.UI.Menu({
                    style: 'min-width: 100px;',
                    maxHeight: 200,
                    additionalAlign: this.menuAddAlign,
                    items: [
                        {caption: this.textSelectRange + '...', value: 'select'},
                        {caption: this.textFrozenRows, value: 'frozen', range: frozen, disabled: !frozen},
                        {caption: this.textFirstRow, value: 'first', range: this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.first, false, this.sheet)},
                        {caption: '--'},
                        {caption: this.textNoRepeat, value: 'empty', range: ''}
                    ]
                }),
                takeFocusOnClose: true
            });
            this.btnPresetsTop.menu.on('item:click', _.bind(this.onPresetSelect, this, 'top'));
            this.txtRangeTop.on('button:click', _.bind(this.onPresetSelect, this, 'top', this.btnPresetsTop.menu, {value: 'select'}));

            this.txtRangeLeft = new Common.UI.InputFieldBtn({
                el          : $('#print-titles-txt-left'),
                style       : 'width: 100%;',
                btnHint     : this.textSelectRange,
                allowBlank  : true,
                validateOnChange: true,
                validation  : function(value) {
                    if (_.isEmpty(value)) {
                        return true;
                    }
                    var isvalid = me.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PrintTitles, value, false);
                    return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.textInvalidRange : true;
                }
            });

            frozen = this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.frozen, true, this.sheet);
            this.btnPresetsLeft = new Common.UI.Button({
                parentEl: $('#print-titles-presets-left'),
                cls: 'btn-text-menu-default',
                caption: this.textRepeat,
                style: 'width: 95px;',
                menu: new Common.UI.Menu({
                    style: 'min-width: 100px;',
                    maxHeight: 200,
                    additionalAlign: this.menuAddAlign,
                    items: [
                        {caption: this.textSelectRange + '...', value: 'select'},
                        {caption: this.textFrozenCols, value: 'frozen', range: frozen, disabled: !frozen},
                        {caption: this.textFirstCol, value: 'first', range: this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.first, true, this.sheet)},
                        {caption: '--'},
                        {caption: this.textNoRepeat, value: 'empty', range: ''}
                    ]
                }),
                takeFocusOnClose: true
            });
            this.btnPresetsLeft.menu.on('item:click', _.bind(this.onPresetSelect, this, 'left'));
            this.txtRangeLeft.on('button:click', _.bind(this.onPresetSelect, this, 'left', this.btnPresetsLeft.menu, {value: 'select'}));

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            $window.find('input').on('keypress', _.bind(this.onKeyPress, this));

            this.setSettings();
        },

        getFocusedComponents: function() {
            return [this.txtRangeTop, this.btnPresetsTop, this.txtRangeLeft, this.btnPresetsLeft].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            if (this._alreadyRendered) return; // focus only at first show
            this._alreadyRendered = true;
            return this.txtRangeTop;
        },

        isRangeValid: function() {
            if (this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PrintTitles, this.txtRangeTop.getValue(), false) == Asc.c_oAscError.ID.DataRangeError)  {
                this.txtRangeTop.focus();
                return false;
            }
            if (this.api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.PrintTitles, this.txtRangeLeft.getValue(), false) == Asc.c_oAscError.ID.DataRangeError)  {
                this.txtRangeLeft.focus();
                return false;
            }
            return true;
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (!this.isRangeValid())
                        return;
                }
                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onKeyPress: function(event) {
            if (event.keyCode == Common.UI.Keys.RETURN) {
                this._handleInput('ok');
            }
        },

        setSettings: function (props) {
            if (this.api) {
                var value = this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.current, false, this.sheet);
                this.txtRangeTop.setValue((value) ? value : '');
                this.dataRangeTop = value;

                value = this.api.asc_getPrintTitlesRange(Asc.c_oAscPrintTitlesRangeType.current, true, this.sheet);
                this.txtRangeLeft.setValue((value) ? value : '');
                this.dataRangeLeft = value;
            }
        },

        getSettings: function() {
            return {width: this.txtRangeLeft.getValue(), height: this.txtRangeTop.getValue()};
        },

        onPresetSelect: function(type, menu, item) {
            var txtRange = (type=='top') ? this.txtRangeTop : this.txtRangeLeft;
            if (item.value == 'select') {
                var me = this;
                if (me.api) {
                    me.btnPresetsTop.menu.options.additionalAlign = me.menuAddAlign;
                    me.btnPresetsLeft.menu.options.additionalAlign = me.menuAddAlign;

                    var handlerDlg = function(dlg, result) {
                        if (result == 'ok') {
                            var valid = dlg.getSettings();
                            if (type=='top')
                                me.dataRangeTop = valid;
                            else
                                me.dataRangeLeft = valid;
                            txtRange.setValue(valid);
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
                        range   : (!_.isEmpty(txtRange.getValue()) && (txtRange.checkValidate()==true)) ? txtRange.getValue() : ((type=='top') ? me.dataRangeTop : me.dataRangeLeft),
                        type    : Asc.c_oAscSelectionDialogType.PrintTitles
                    });
                }
            } else {
                var value = item.options.range || '';
                txtRange.setValue(value);
                txtRange.checkValidate();
                if (type=='top')
                    this.dataRangeTop = value;
                else
                    this.dataRangeLeft = value;
            }
        },

        textTitle: 'Print Titles',
        textTop: 'Repeat rows at top',
        textLeft: 'Repeat columns at left',
        textRepeat: 'Repeat...',
        textNoRepeat: 'Not repeat',
        textSelectRange: 'Select range',
        textFrozenRows: 'Frozen rows',
        textFrozenCols: 'Frozen columns',
        textFirstRow: 'First row',
        textFirstCol: 'First column',
        textInvalidRange:   'ERROR! Invalid cells range'

    }, SSE.Views.PrintTitlesDialog || {}))
});