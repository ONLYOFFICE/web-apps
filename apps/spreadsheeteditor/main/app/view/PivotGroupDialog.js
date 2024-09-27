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
 *  PivotGroupDialog.js
 *
 *  Created on 04.03.2021
 *
 */

define([], function () {
    'use strict';

    SSE.Views.PivotGroupDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 250,
            header: true,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function (options) {
            var t = this,
                height = options.date ? 250 : 110;

            _.extend(this.options, {
                title: this.txtTitle
            }, options || {});

            this.template   =   options.template || [
                    '<div class="box" style="height:' + height + 'px;">',
                        '<table cols="2" style="width: 100%;">',
                            '<tr>',
                                '<td colspan="2" style="padding-bottom: 4px;">',
                                    '<label class="font-weight-bold">' + this.textAuto + '</label>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-right-10" style="padding-bottom: 8px;width: 100%;">',
                                    '<div id="pivot-group-dlg-chk-start" style="margin-top: 2px;"></div>',
                                '</td>',
                                '<td style="padding-bottom: 8px;">',
                                    '<div id="pivot-group-dlg-txt-start"></div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-right-10" style="padding-bottom: 8px;width: 100%;">',
                                    '<div id="pivot-group-dlg-chk-end" style="margin-top: 2px;"></div>',
                                '</td>',
                                '<td style="padding-bottom: 8px;">',
                                    '<div id="pivot-group-dlg-txt-end"></div>',
                                '</td>',
                            '</tr>',
                            '<tr class="group-number">',
                                '<td class="padding-right-10" style="padding-bottom: 8px;width: 100%;">',
                                    '<label class="margin-left-22" style="margin-top:2px;">' + t.textBy + '</label>',
                                '</td>',
                                '<td style="padding-bottom: 8px;">',
                                    '<div id="pivot-group-dlg-txt-by"></div>',
                                '</td>',
                            '</tr>',
                            '<tr class="group-date">',
                                '<td colspan="2" style="padding-bottom: 4px;">',
                                   '<label class="font-weight-bold">' + this.textBy + '</label>',
                                '</td>',
                            '</tr>',
                            '<tr class="group-date">',
                                '<td colspan="2" style="padding-bottom: 8px;">',
                                    '<div id="pivot-group-dlg-list" style="height:116px;"></div>',
                                '</td>',
                            '</tr>',
                            '<tr class="group-date">',
                                '<td class="padding-right-10" style="width: 100%;">',
                                    '<label style="margin-top:2px;">' + t.textNumDays + '</label>',
                                '</td>',
                                '<td>',
                                    '<div id="pivot-group-dlg-spn-days"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>'
                ].join('');

            this.api            =   options.api;
            this.handler        =   options.handler;

            this.options.tpl = _.template(this.template)(this.options);
            Common.UI.Window.prototype.initialize.call(this, this.options);
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            this.$window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));

            var me = this;

            this.chStart = new Common.UI.CheckBox({
                el: $('#pivot-group-dlg-chk-start', this.$window),
                labelText: this.textStart
            });
            this.chStart.on('change', function (field, newValue, oldValue, eOpts) {
                if (newValue=='checked' && me.defRangePr) {
                    me.inputStart.setValue(me.defRangePr.start);
                }
            });

            this.chEnd = new Common.UI.CheckBox({
                el: $('#pivot-group-dlg-chk-end', this.$window),
                labelText: this.textEnd
            });
            this.chEnd.on('change', function (field, newValue, oldValue, eOpts) {
                if (newValue=='checked' && me.defRangePr) {
                    me.inputEnd.setValue(me.defRangePr.end);
                }
            });

            this.inputStart = new Common.UI.InputField({
                el               : $('#pivot-group-dlg-txt-start', this.$window),
                style            : 'width: 100px;',
                allowBlank       : true,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                me.chStart.setValue(false, true);
            });

            this.inputEnd = new Common.UI.InputField({
                el               : $('#pivot-group-dlg-txt-end', this.$window),
                style            : 'width: 100px;',
                allowBlank       : true,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                me.chEnd.setValue(false, true);
            });

            this.inputBy = new Common.UI.InputField({
                el               : $('#pivot-group-dlg-txt-by', this.$window),
                style            : 'width: 100px;',
                allowBlank       : true,
                validateOnChange : true,
                validation       : function () { return true; }
            }).on ('changing', function (input, value) {
                if (value.length) {
                }
            });

            this.spnDays = new Common.UI.MetricSpinner({
                el: $('#pivot-group-dlg-spn-days', this.$window),
                step: 1,
                width: 100,
                defaultUnit : "",
                value: '1',
                maxValue: 32767,
                minValue: 1
            });
            this.spnDays.on('change', _.bind(function(field, newValue, oldValue, eOpts){
            }, this));

            var arr = [
                { value: this.textSec, type: Asc.c_oAscGroupBy.Seconds},
                { value: this.textMin, type: Asc.c_oAscGroupBy.Minutes},
                { value: this.textHour, type: Asc.c_oAscGroupBy.Hours},
                { value: this.textDays, type: Asc.c_oAscGroupBy.Days},
                { value: this.textMonth, type: Asc.c_oAscGroupBy.Months},
                { value: this.textQuart, type: Asc.c_oAscGroupBy.Quarters},
                { value: this.textYear, type: Asc.c_oAscGroupBy.Years}
            ];
            this.listDate = new Common.UI.ListView({
                el: $('#pivot-group-dlg-list', this.$window),
                store: new Common.UI.DataViewStore(arr),
                multiSelect: true,
                tabindex: 1,
                itemTemplate: _.template('<div id="<%= id %>" class="list-item" style="pointer-events:none;"><%= value %></div>')
            });

            this.listDate.on('item:select', _.bind(this.onSelectDate, this));
            this.listDate.on('item:deselect', _.bind(this.onSelectDate, this));
            this.listDate.on('entervalue', _.bind(this.onPrimary, this));

            this.btnOk = _.find(this.getFooterButtons(), function (item) {
                return (item.$el && item.$el.find('.primary').addBack().filter('.primary').length>0);
            }) || new Common.UI.Button({ el: this.$window.find('.primary') });
        },

        getFocusedComponents: function() {
            return [this.chStart, this.inputStart, this.chEnd, this.inputEnd, this.inputBy, this.listDate, this.spnDays].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputStart;
        },

        onBtnClick: function (event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        onSelectDate: function (listView, itemView, record) {
            if (!record || record.length<1) return;
            if (record.get('type')==Asc.c_oAscGroupBy.Days)
                this.isDays = record.get('selected');
            var selected = this.listDate.getSelectedRec().length;
            this.spnDays.setDisabled(!this.isDays || selected>1);
            this.btnOk.setDisabled(selected<1);
        },

        setSettings: function (rangePr, dateTypes, defRangePr) {
            this.$window.find('.group-number').toggleClass('hidden', !!dateTypes);
            this.$window.find('.group-date').toggleClass('hidden', !dateTypes);
            if (rangePr) {
                this.chStart.setValue(rangePr.asc_getAutoStart(), true);
                this.chEnd.setValue(rangePr.asc_getAutoEnd(), true);
                var value = dateTypes ? rangePr.asc_getStartDateText() : rangePr.asc_getStartNum();
                this.inputStart.setValue(value!==null && value!==undefined ? value : '');
                value = dateTypes ? rangePr.asc_getEndDateText() : rangePr.asc_getEndNum();
                this.inputEnd.setValue(value!==null && value!==undefined ? value : '');
                !dateTypes && this.inputBy.setValue(rangePr.asc_getGroupInterval());
                this.rangePr = rangePr;
                if (defRangePr) {
                    this.defRangePr = {start: dateTypes ? defRangePr.asc_getStartDateText() : defRangePr.asc_getStartNum(), end: dateTypes ? defRangePr.asc_getEndDateText() : defRangePr.asc_getEndNum()};
                }
            }
            if (dateTypes) {
                var me = this,
                    isDays;
                this.listDate.setMultiselectMode(dateTypes.length>1);
                _.each(dateTypes, function(item) {
                    var rec = me.listDate.store.findWhere({type: item});
                    rec && me.listDate.selectRecord(rec);
                    if (item == Asc.c_oAscGroupBy.Days)
                        isDays = true;
                });
                this.listDate.setMultiselectMode(false);
                this.spnDays.setValue(rangePr.asc_getGroupInterval());
                this.spnDays.setDisabled(!isDays || dateTypes.length>1);
                this.btnOk.setDisabled(dateTypes.length<1);
                this.dateTypes = dateTypes;
                this.isDays = isDays;
            }
        },

        getSettings: function() {
            if (this.rangePr) {
                this.rangePr.asc_setAutoStart(this.chStart.getValue()=='checked');
                this.rangePr.asc_setAutoEnd(this.chEnd.getValue()=='checked');
                if (this.dateTypes) {
                    this.dateTypes = this.listDate.getSelectedRec().map(function(item){return item.get('type');});
                    this.rangePr.asc_setGroupInterval(this.spnDays.getNumberValue());
                    this.rangePr.asc_setStartDateText(this.inputStart.getValue());
                    this.rangePr.asc_setEndDateText(this.inputEnd.getValue());
                } else {
                    this.rangePr.asc_setStartNum(parseFloat(this.inputStart.getValue().toString().replace(',','.')));
                    this.rangePr.asc_setEndNum(parseFloat(this.inputEnd.getValue().toString().replace(',','.')));
                    this.rangePr.asc_setGroupInterval(parseFloat(this.inputBy.getValue().toString().replace(',','.')));
                }
            }

            return [this.rangePr, this.dateTypes];
        },

        isRangeValid: function() {
            if (this.dateTypes) {
                if (this.rangePr) {
                    this.rangePr.asc_setStartDateText(this.inputStart.getValue());
                    var res1 = this.rangePr.asc_getStartDate();
                    if (isNaN(res1)) {
                        this.inputStart.showError([this.textError]);
                        this.inputStart.focus();
                        return false;
                    }
                    this.rangePr.asc_setEndDateText(this.inputEnd.getValue());
                    var res2 = this.rangePr.asc_getEndDate();
                    if (isNaN(res2)) {
                        this.inputEnd.showError([this.textError]);
                        this.inputEnd.focus();
                        return false;
                    }
                    if (res2<res1) {
                        Common.UI.warning({msg: this.textGreaterError, maxwidth: 600});
                        this.inputEnd.focus();
                        return false;
                    }
                }
            } else {
                var regstr = new RegExp('^\s*[-]?[0-9]+[,.]?[0-9]*\s*$');
                var res1 = this.inputStart.getValue().toString();
                if (!regstr.test(res1)) {
                    this.inputStart.showError([this.textError]);
                    this.inputStart.focus();
                    return false;
                }
                var res2 = this.inputEnd.getValue().toString();
                if (!regstr.test(res2)) {
                    this.inputEnd.showError([this.textError]);
                    this.inputEnd.focus();
                    return false;
                }
                if (parseFloat(res2.replace(',','.'))<parseFloat(res1.replace(',','.'))) {
                    Common.UI.warning({msg: this.textGreaterError, maxwidth: 600});
                    this.inputEnd.focus();
                    return false;
                }
                if (!regstr.test(this.inputBy.getValue().toString())) {
                    this.inputBy.showError([this.textError]);
                    this.inputBy.focus();
                    return false;
                }
            }

            return true;
        },

        onPrimary: function(list, record, event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state == 'ok') {
                    if (this.btnOk.isDisabled() || !this.isRangeValid())  return;
                }

                this.options.handler.call(this, this, state);
            }

            this.close();
        },

        txtTitle: 'Grouping',
        textAuto: 'Auto',
        textBy: 'By',
        textStart: 'Starting at',
        textEnd: 'Ending at',
        textNumDays: 'Number of days',
        textSec: 'Seconds',
        textMin: 'Minutes',
        textHour: 'Hours',
        textDays: 'Days',
        textMonth: 'Months',
        textQuart: 'Quarters',
        textYear: 'Years',
        textError: 'This field must be a numeric value',
        textGreaterError: 'The end number must be greater than the start number'

    }, SSE.Views.PivotGroupDialog || {}));
});