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
 *  CellRangeDialog.js
 *
 *  Created on 6/3/14
 *
 */


if (Common === undefined)
    var Common = {};

define([], function () { 'use strict';

    SSE.Views.CellRangeDialog = Common.UI.Window.extend(_.extend({
        options: {
            width   : 350,
            cls     : 'modal-dlg',
            modal   : false,
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle
            }, options);

            this.template = [
                '<div class="box">',
                    '<div id="id-dlg-cell-range" class="input-row" style="margin-bottom: 5px;"></div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var $window = this.getChild(),
                me = this;

            me.inputRange = new Common.UI.InputField({
                el          : $('#id-dlg-cell-range'),
                name        : 'range',
                style       : 'width: 100%;',
                allowBlank  : this.options.allowBlank || false,
                blankError  : this.txtEmpty,
                validateOnChange: true
            });

            $window.find('.dlg-btn').on('click',     _.bind(this.onBtnClick, this));

            this.on('close', _.bind(this.onClose, this));

//            _.defer(function(){
//                $window.find('input[name="range"]').focus();
//            }, 10);
        },

        onPrimary: function() {
            this._handleInput('ok');
            return false;
        },

        setSettings: function(settings) {
            var me = this;

            this.settings = settings;
            this.inputRange.setValue(settings.range ? settings.range : '');

            if (settings.type===undefined)
                settings.type = Asc.c_oAscSelectionDialogType.Chart;

            if (settings.api) {
                me.api = settings.api;
                me.wrapEvents = {
                    onApiRangeChanged: _.bind(me.onApiRangeChanged, me)
                };

                me.api.asc_setSelectionDialogMode(settings.type, settings.range ? settings.range : '');
                me.api.asc_registerCallback('asc_onSelectionRangeChanged', me.wrapEvents.onApiRangeChanged);
                Common.NotificationCenter.trigger('cells:range', settings.type);
            }

            me.inputRange.validation = function(value) {
                if (settings.validation) {
                    return settings.validation.call(me, value);
                } else {
                    if (settings.type === Asc.c_oAscSelectionDialogType.Function) {
                        settings.argvalues[settings.argindex] = value;
                        me.api.asc_insertArgumentsInFormula(settings.argvalues);
                    }
                    var isvalid = (settings.type === Asc.c_oAscSelectionDialogType.Function) || me.api.asc_checkDataRange(settings.type, value, false);
                    return (isvalid==Asc.c_oAscError.ID.DataRangeError) ? me.txtInvalidRange : true;
                }
            };

            if (settings.type == Asc.c_oAscSelectionDialogType.Function) {
                _.delay(function(){
                    me.inputRange._input.focus();
                    if (settings.selection) {
                        me.inputRange._input[0].selectionStart = settings.selection.start;
                        me.inputRange._input[0].selectionEnd = settings.selection.end;
                    }
                },10);
                me.inputRange._input.on('focus', function() {
                    me._addedTextLength=0;
                    me.api.asc_cleanSelectRange();
                });
            }
        },

        getSettings: function () {
            return this.inputRange.getValue();
        },

        onApiRangeChanged: function(name) {
            if (this.settings.type == Asc.c_oAscSelectionDialogType.Function) {
                var oldlen = this._addedTextLength || 0,
                    val = this.inputRange.getValue(),
                    input = this.inputRange._input[0],
                    start = input.selectionStart - oldlen,
                    end =  input.selectionEnd,
                    add = (start>0 && oldlen==0) && !this.api.asc_canEnterWizardRange(val.charAt(start-1)) ? '+' : '';
                this._addedTextLength = name.length;

                val = val.substring(0, start) + add + name + val.substring(end, val.length);
                this.inputRange.setValue(val);
                input.selectionStart = input.selectionEnd = start + add.length + this._addedTextLength;

                this.settings.argvalues[this.settings.argindex] = val;
                this.api.asc_insertArgumentsInFormula(this.settings.argvalues);
            } else if (this.settings.type == Asc.c_oAscSelectionDialogType.DataValidation || this.settings.type == Asc.c_oAscSelectionDialogType.ConditionalFormattingRule) {
                this.inputRange.setValue('=' + name);
            } else
                this.inputRange.setValue(name);
            if (this.inputRange.cmpEl.hasClass('error'))
                this.inputRange.cmpEl.removeClass('error');
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onClose: function(event) {
            if (this.api) {
                this.api.asc_setSelectionDialogMode(Asc.c_oAscSelectionDialogType.None);
                this.api.asc_unregisterCallback('asc_onSelectionRangeChanged', this.wrapEvents.onApiRangeChanged);
            }
            Common.NotificationCenter.trigger('cells:range', Asc.c_oAscSelectionDialogType.None);

            SSE.getController('RightMenu').SetDisabled(false);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (this.inputRange.checkValidate() !== true)
                        return;
                }
                if (this.options.handler.call(this, this, state))
                    return;
            }

            this.close();
        },

        show: function () {
            Common.UI.Window.prototype.show.call(this);
            SSE.getController('RightMenu').SetDisabled(true);
        },

        txtTitle   : 'Select Data Range',
        txtEmpty    : 'This field is required',
        txtInvalidRange: 'ERROR! Invalid cells range',
        errorMaxRows: 'ERROR! The maximum number of data series per chart is 255.',
        errorStockChart: 'Incorrect row order. To build a stock chart place the data on the sheet in the following order:<br> opening price, max price, min price, closing price.'
    }, SSE.Views.CellRangeDialog || {}))
});