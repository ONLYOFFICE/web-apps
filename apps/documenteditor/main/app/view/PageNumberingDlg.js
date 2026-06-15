/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *  PageNumberingDlg.js
 *
 *  Created on 24.10.2025
 *
 */

define([], function () {
    'use strict';

    var nMaxRecent = 5;

    DE.Views.PageNumberingDlg = Common.UI.Window.extend(_.extend({

        initialize : function (options) {
            var t = this,
                _options = {};

            _.extend(_options,  {
                title: options.title ? options.title : this.txtTitle,
                cls: 'modal-dlg',
                width: 350,
                height: 'auto',
                buttons: options.buttons ? options.buttons : ['ok', 'cancel']
            }, options);

            this.recentNumTypes = [];
            this.handler = options.handler;
            this.props = options.props;
            this.numbering = options.numbering;
            this.numFormat = options.numFormat;
            this.mode = options.mode;

            this.template = options.template || [
                '<div class="box">',
                    '<div id="id-headerfooter-radio-prev" style="margin-bottom: 8px;"></div>' +
                    '<div class="" style="margin-bottom: 5px;">',
                        '<div id="id-headerfooter-radio-from" style="margin-bottom: 8px; display: inline-block; vertical-align: middle;"></div>' +
                        '<div id="id-headerfooter-spin-from" style="margin-bottom: 8px; display: inline-block; vertical-align: middle; margin-left: 5px;"></div>' +
                    '</div>' +
                    `<label id="id-headerfooter-label-format" class="input-label">${t.textNumberFormat}</label>` +
                    '<div id="id-headerfooter-combo-format"></div>' +
                '</div>'
            ].join('');

            _options.tpl        =   _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            var me = this;
            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            this.rbPrev = new Common.UI.RadioBox({
                el: this.$window.find('#id-headerfooter-radio-prev'),
                labelText: this.textPrev,
                name: 'asc-radio-header-numbering',
            })

            this.rbFrom = new Common.UI.RadioBox({
                el: this.$window.find('#id-headerfooter-radio-from'),
                labelText: this.textFrom,
                name: 'asc-radio-header-numbering',
                checked: true
            })

            this.numFrom = new Common.UI.MetricSpinner({
                el: this.$window.find('#id-headerfooter-spin-from'),
                step: 1,
                width: 85,
                value: '1',
                defaultUnit : "",
                maxValue: 2147483646,
                minValue: 0,
                allowDecimal: false,
                ariaLabel: this.textFrom
            });

            this._arrNumbers = [
                { displayValue: '1, 2, 3,...',      value: Asc.c_oAscNumberingFormat.Decimal },
                { displayValue: '- 1 -, - 2 -, - 3 -,...',      value: Asc.c_oAscNumberingFormat.NumberInDash },
                { displayValue: 'a, b, c,...',      value: Asc.c_oAscNumberingFormat.LowerLetter },
                { displayValue: 'A, B, C,...',      value: Asc.c_oAscNumberingFormat.UpperLetter },
                { displayValue: 'i, ii, iii,...',   value: Asc.c_oAscNumberingFormat.LowerRoman },
                { displayValue: 'I, II, III,...',   value: Asc.c_oAscNumberingFormat.UpperRoman }
            ];
            if (Common.Locale.getDefaultLanguage() === 'ru') {
                this._arrNumbers = this._arrNumbers.concat([
                    { displayValue: 'а, б, в,...',      value: Asc.c_oAscNumberingFormat.RussianLower },
                    { displayValue: 'А, Б, В,...',      value: Asc.c_oAscNumberingFormat.RussianUpper }
                ]);
            }

            this.loadRecent();

            this.cmbFormat = new Common.UI.ComboBox({
                el          : this.$window.find('#id-headerfooter-combo-format'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 100%;max-height: 220px;',
                menuAlignEl: this.$window.find(this.el).parent(),
                restoreMenuHeightAndTop: 110,
                style       : "width: 150px;",
                takeFocusOnClose: true,
                editable    : false,
                data        : []
            });

            if (this.numbering < 0) {
                this.rbPrev.setValue(true, true);
            } else {
                this.rbFrom.setValue(true, true);
                this.numFrom.setValue(this.numbering, true);
            }
            this.fillFormatCombo(this.numFormat);
            this.cmbFormat.on('selected', _.bind(this.onFormatSelect, this));

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: this.$window.find('.primary') });

            this.afterRender();
        },

        loadRecent: function(){
            var sRecents = Common.localStorage.getItem('de-recent-header-formats');
            if(sRecents !== ''){
                sRecents = JSON.parse(sRecents);
            }
            if(_.isArray(sRecents)){
                this.recentNumTypes = sRecents;
            }
        },

        onFormatSelect: function (combo, record) {
            if (record.value === -2) {
                this.addNewListType();
            }
        },

        addNewListType: function() {
            var me = this,
                btn,
                win = new DE.Views.ListTypesAdvanced({
                    modal: true,
                    lang: me.mode.lang,
                    handler: function(result, value) {
                        btn = result;
                        if (result == 'ok') {
                            me.fillFormatCombo(+value)
                            me.numFormat = +value;
                        }
                    }
                }).on('close', function(obj){
                    (btn!=='ok') && me.cmbFormat.setValue(me.numFormat);
                    setTimeout(function(){me.cmbFormat.focus();}, 1);
                });
            win.show();
        },

        fillFormatCombo: function(format) {
            if (format !== Asc.c_oAscNumberingFormat.None && format !== undefined && format !== null)
                this.checkRecentNum(format);

            var store = [].concat(this._arrNumbers),
                me = this;
            this.recentNumTypes.forEach(function(item) {
                if (item!==null && item!==undefined) {
                    item = parseInt(item);
                    store.push({ displayValue: AscCommon.IntToNumberFormat(1, item, me.mode.lang) + ', ' + AscCommon.IntToNumberFormat(2, item, me.mode.lang) + ', ' + AscCommon.IntToNumberFormat(3, item, me.mode.lang) + ',...', value: item });
                }
            });
            store.push({ displayValue: this.textMoreTypes, value: -2 });
            this.cmbFormat.setData(store);
            this.cmbFormat.setValue(format !== Asc.c_oAscNumberingFormat.None && format !== undefined && format !== null ? format : '');
        },

        checkRecentNum: function(format){
            if (format===null || format===undefined) return;

            for(var i = 0; i < this._arrNumbers.length; ++i){
                if(this._arrNumbers[i].value === format){
                    return;
                }
            }
            if(this.recentNumTypes.length === 0){
                this.recentNumTypes.push(format);
                this.saveRecentNum();
                return;
            }
            for (var i = 0; i < this.recentNumTypes.length; ++i){
                if(this.recentNumTypes[i] === format){
                    this.recentNumTypes.splice(i, 1);
                    break;
                }
            }
            this.recentNumTypes.splice(0, 0, format);
            if(this.recentNumTypes.length > nMaxRecent){
                this.recentNumTypes.splice(nMaxRecent, this.recentNumTypes.length - nMaxRecent);
            }
            this.saveRecentNum();
        },

        saveRecentNum: function(){
            var sJSON = JSON.stringify(this.recentNumTypes);
            Common.localStorage.setItem('de-recent-header-formats', sJSON);
        },

        getFocusedComponents: function() {
            return [this.rbPrev, this.rbFrom, this.numFrom, this.cmbFormat].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.rbPrev;
        },


        afterRender: function() {
            this._setDefaults(this.props);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            var me = this;

            if (this.handler) {
                if (state === 'ok') {
                    if (this.rbPrev.getValue()) {
                        me.from = -1;
                    } else {
                        me.from = +this.numFrom.getValue();
                    }
                    me.format = +this.cmbFormat.getValue();
                }
                this.handler.call(this, state, me.from, me.format);
            }

            this.close();
        },

        _setDefaults: function (props) {
            if (props) {
            }
        },

        getSettings: function() {

        },

    }, DE.Views.PageNumberingDlg || {}));
});