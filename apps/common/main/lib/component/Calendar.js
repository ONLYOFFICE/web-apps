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
if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/util/utils'

], function () {
    'use strict';

    Common.UI.Calendar = Common.UI.BaseView.extend({

        template    :
            _.template([
                '<div id="calendar" class="calendar-box">',
                '<div class="calendar-header">',
                '<div class="top-row">',
                '<div id="prev-arrow"><button type="button" style="width: 24px;height: 24px;"><i class="icon mmerge-prev">&nbsp;</i></button></div>',
                '<div class="title"></div>',
                '<div id="next-arrow"><button type="button" style="width: 24px;height: 24px;"><i class="icon mmerge-next">&nbsp;</i></button></div>',
                '</div>',
                '<div class="bottom-row">',
                '</div>',
                '</div>',
                '<div class="calendar-content"></div>',
                '</div>'
                ].join('')),

        options: {
            date: undefined,
            firstday: 0 // 0 or 1
        },

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;
            me.cmpEl = me.$el || $(this.el);

            this.monthNames = [this.textJanuary, this.textFebruary, this.textMarch, this.textApril, this.textMay, this.textJune, this.textJuly, this.textAugust, this.textSeptember, this.textOctober, this.textNovember, this.textDecember];
            this.dayNamesShort = [this.textShortSunday, this.textShortMonday, this.textShortTuesday, this.textShortWednesday, this.textShortThursday, this.textShortFriday, this.textShortSaturday];
            this.monthShortNames = [this.textShortJanuary, this.textShortFebruary, this.textShortMarch, this.textShortApril, this.textShortMay, this.textShortJune, this.textShortJuly, this.textShortAugust, this.textShortSeptember, this.textShortOctober, this.textShortNovember, this.textShortDecember];

            me.options.date = options.date;
            if (!_.isUndefined(options.firstday) && (options.firstday === 0 || options.firstday === 1)) {
                me.options.firstday = options.firstday;
            }

            me._state = undefined;

            me.render();
        },

        render: function () {
            (this.$el || $(this.el)).html(this.template());

            var me = this;

            me.currentDate = me.options.date || new Date();

            me.btnPrev = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'mmerge-prev',
            });
            me.btnPrev.render(me.cmpEl.find('#prev-arrow'));
            me.btnPrev.on('click', _.bind(me.onClickPrev, me));

            me.btnNext = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'mmerge-next',
            });
            me.btnNext.render(me.cmpEl.find('#next-arrow'));
            me.btnNext.on('click', _.bind(me.onClickNext, me));

            me.renderMonth(me.currentDate);

            this.trigger('render:after', this);
            return this;
        },

        onClickPrev: function () {
            var me = this;
            if (me._state === 'month') {
                me.currentDate.setMonth(me.currentDate.getMonth() - 1);
                me.renderMonth(me.currentDate);
            } else if (me._state === 'months') {
                me.currentDate.setFullYear(me.currentDate.getFullYear() - 1);
                me.renderMonths(me.currentDate);
            } else if (me._state === 'years') {
                var year = me.currentDate.getFullYear(),
                    newYear;
                if (year % 10 !== 0) {
                    newYear = String(year);
                    newYear = Number(newYear.slice(0, -1) + '0') - 1;
                } else {
                    newYear = year - 1;
                }
                me.currentDate.setFullYear(newYear);
                me.renderYears(newYear);
            }
        },

        onClickNext: function () {
            var me = this;
            if (me._state === 'month') {
                me.currentDate.setMonth(me.currentDate.getMonth() + 1);
                me.renderMonth(me.currentDate);
            } else if (me._state === 'months') {
                me.currentDate.setFullYear(me.currentDate.getFullYear() + 1);
                me.renderMonths(me.currentDate);
            } else if (me._state === 'years') {
                var year = me.currentDate.getFullYear(),
                    newYear;
                if (year % 10 !== 9) {
                    newYear = String(year);
                    newYear = Number(newYear.slice(0, -1) + '9') + 1;
                } else {
                    newYear = year + 1;
                }
                me.currentDate.setFullYear(newYear);
                me.renderYears(newYear);
            }
        },

        renderYears: function (year) {
            var me = this,
                year = _.isNumber(year) ? year : (me.currentDate ? me.currentDate.getFullYear() : new Date().getFullYear());

            me._state = 'years';

            var firstYear = year,
                lastYear = year;
            if ((firstYear % 10) !== 0) {
                var strYear = String(year);
                firstYear = Number(strYear.slice(0, -1) + '0');
            }
            if ((lastYear % 10) !== 9) {
                var strYear = String(year);
                lastYear = Number(strYear.slice(0, -1) + '9');
            }

            me.topTitle = _.template([
                '<label>' + firstYear + '-' + lastYear + '</label>'
            ].join(''));
            me.cmpEl.find('.calendar-header .title').html(me.topTitle);

            me.bottomTitle = _.template([
                '<label>' + me.textYears + '</label>'
            ].join(''));
            me.cmpEl.find('.calendar-header .bottom-row').html(me.bottomTitle);

            var arrYears = [];
            var tmpYear = firstYear - 3;

            for (var i = 0; i < 16; i++) {
                arrYears.push({
                    year: (tmpYear > 0) ? tmpYear : '',
                    isCurrentDecade: ((tmpYear >= firstYear) && (tmpYear <= lastYear)) ? true : false,
                    disabled: (tmpYear > 0) ? false : true
                });
                tmpYear++;
            }

            me.yearPicker = new Common.UI.DataView({
                el: $('.calendar-content'),
                store: new Common.UI.DataViewStore(arrYears),
                itemTemplate: _.template('<div class="name-year <% if (!isCurrentDecade) { %> no-current-decade <% } %>" data-year="<%= year %>"><%= year %></div>')
            });
            me.yearPicker.on('item:click', function (picker, item, record, e) {
                var year = record.get('year'),
                    date = new Date();
                date.setFullYear(year);
                me.renderMonths(date);
            });
        },

        renderMonths: function (date) {
            var me = this,
                curDate = (_.isDate(date)) ? date : (me.currentDate ? me.currentDate : new Date()),
                year = curDate.getFullYear();

            me._state = 'months';

            // Number of year
            me.topTitle = _.template([
                '<label>' + year + '</label>'
            ].join(''));
            me.cmpEl.find('.calendar-header .title').html(me.topTitle);
            me.cmpEl.find('.calendar-header .title').on('click', _.bind(me.renderYears, me));

            me.bottomTitle = _.template([
                '<label>' + me.textMonths + '</label>'
            ].join(''));
            me.cmpEl.find('.calendar-header .bottom-row').html(me.bottomTitle);

            var arrMonths = [];

            for (var ind = 0; ind < 12; ind++) {
                arrMonths.push({
                    indexMonth: ind,
                    nameMonth: me.monthShortNames[ind],
                    year: year,
                    curYear: true,
                    isCurrentMonth: (ind === curDate.getMonth())
                });
            }
            for (var ind = 0; ind < 4; ind++) {
                arrMonths.push({
                    indexMonth: ind,
                    nameMonth: me.monthShortNames[ind],
                    year: year + 1,
                    curYear: false
                });
            }

            me.monthPicker = new Common.UI.DataView({
                el: $('.calendar-content'),
                store: new Common.UI.DataViewStore(arrMonths),
                itemTemplate: _.template('<div class="name-month <% if (!curYear) { %> no-cur-year <% } %>" data-month="<%= indexMonth %>" data-year="<%= year %>"><%= nameMonth %></div>')
            });
            me.monthPicker.on('item:click', function (picker, item, record, e) {
                var month = record.get('indexMonth'),
                    year = record.get('year'),
                    date = new Date(year, month);
                me.renderMonth(date);
            });
        },

        renderMonth: function (date) {
            var me = this;
            me._state = 'month';
            var firstDay = me.options.firstday;

            // Current date
            var curDate = date || new Date(),
                curMonth = curDate.getMonth(),
                curIndexDayInWeek = curDate.getDay(),
                curNumberDayInMonth = curDate.getDate(),
                curYear = curDate.getFullYear();

            // Name month
            me.topTitle = _.template([
                '<label>' + me.monthNames[curMonth] + '</label>',
                '<label>' + curYear + '</label>'
            ].join(''));
            me.cmpEl.find('.calendar-header .title').html(me.topTitle);
            me.cmpEl.find('.calendar-header .title').on('click', _.bind(me.renderMonths, me));

            // Name days of week
            var dayNamesTemplate = '';
            for (var i = firstDay; i < 7; i++) {
                dayNamesTemplate += '<label>' + me.dayNamesShort[i] + '</label>';
            }
            if (firstDay > 0) {
                dayNamesTemplate += '<label>' + me.dayNamesShort[0] + '</label>';
            }
            me.cmpEl.find('.calendar-header .bottom-row').html(_.template(dayNamesTemplate));

            // Month
            var rows = 6,
                cols = 7;

            var arrDays = [];

            var d = new Date(curDate);
            d.setDate(1);
            var firstDayOfMonthIndex = d.getDay();

            var daysInPrevMonth = me.daysInMonth(d.getTime() - (10 * 24 * 60 * 60 * 1000)),
                numberDay,
                month,
                year;
            if (firstDay === 0) {
                numberDay = (firstDayOfMonthIndex > 0) ? (daysInPrevMonth - (firstDayOfMonthIndex - 1)) : 1;
            } else {
                if (firstDayOfMonthIndex === 0) {
                    numberDay = daysInPrevMonth - 5;
                } else {
                    numberDay = daysInPrevMonth - (firstDayOfMonthIndex - 2);
                }
            }
            if ((firstDayOfMonthIndex > 0 && firstDay === 0) || firstDay === 1) {
                if (curMonth - 1 >= 0) {
                    month = curMonth - 1;
                    year = curYear;
                } else {
                    month = 11;
                    year = curYear - 1;
                }
            } else {
                month = curMonth;
                year = curYear;
            }

            var tmp = new Date(year, month, numberDay);

            for(var r = 0; r < rows; r++) {
                for(var c = 0; c < cols; c++) {
                    arrDays.push({
                        indexInWeek: tmp.getDay(),
                        dayNumber: tmp.getDate(),
                        month: tmp.getMonth(),
                        year: tmp.getFullYear(),
                        isToday: (tmp.getDate() === curNumberDayInMonth) ? true : false,
                        isCurrentMonth: (tmp.getMonth() === curMonth) ? true : false
                    });
                    tmp.setDate(tmp.getDate() + 1);
                }
            }

            me.monthPicker = new Common.UI.DataView({
                el: $('.calendar-content'),
                store: new Common.UI.DataViewStore(arrDays),
                itemTemplate: _.template('<div class="number-day <% if (isToday) { %> today <% } %> <% if (indexInWeek === 6 || indexInWeek === 0) { %> weekend <% } %> <% if (!isCurrentMonth) { %> no-current-month <% } %>" data-number="<%= dayNumber %>" data-month="<%= month %>" data-year="<%= year %>"><%= dayNumber %></div>')
            });
        },

        daysInMonth: function (date) {
            var d;
            d = date ? new Date(date) : new Date();
            return (new Date(d.getFullYear(), d.getMonth() + 1, 0)).getDate();
        },

        textJanuary: 'January',
        textFebruary: 'February',
        textMarch: 'March',
        textApril: 'April',
        textMay: 'May',
        textJune: 'June',
        textJuly: 'July',
        textAugust: 'August',
        textSeptember: 'September',
        textOctober: 'October',
        textNovember: 'November',
        textDecember: 'December',
        textShortJanuary: 'Jan',
        textShortFebruary: 'Feb',
        textShortMarch: 'Mar',
        textShortApril: 'Apr',
        textShortMay: 'May',
        textShortJune: 'Jun',
        textShortJuly: 'Jul',
        textShortAugust: 'Aug',
        textShortSeptember: 'Sep',
        textShortOctober: 'Oct',
        textShortNovember: 'Nov',
        textShortDecember: 'Dec',
        textShortSunday: 'Su',
        textShortMonday: 'Mo',
        textShortTuesday: 'Tu',
        textShortWednesday: 'We',
        textShortThursday: 'Th',
        textShortFriday: 'Fr',
        textShortSaturday: 'Sa',
        textMonths: 'Months',
        textYears: 'Years'
    });
});