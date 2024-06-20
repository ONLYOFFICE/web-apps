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
if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/BaseView',
    'common/main/lib/util/utils'
], function () {
    'use strict';

    Common.UI.Calendar = Common.UI.BaseView.extend(_.extend({

        template    :
            _.template([
                '<div id="calendar" class="calendar-box">',
                    '<div class="calendar-header">',
                        '<div class="top-row">',
                            '<div id="prev-arrow"><button type="button"><i class="arrow-prev img-commonctrl"></i></button></div>',
                            '<div class="title"></div>',
                            '<div id="next-arrow"><button type="button"><i class="arrow-next img-commonctrl" /></button></div>',
                        '</div>',
                        '<div class="bottom-row"></div>',
                    '</div>',
                    '<div class="calendar-content"></div>',
                '</div>'
                ].join('')),

        options: {
            date: undefined,
            firstday: 0 // 0 - sunday, 1 - monday
        },

        initialize : function(options) {
            Common.UI.BaseView.prototype.initialize.call(this, options);

            var me = this;

            this.monthNames = [this.textJanuary, this.textFebruary, this.textMarch, this.textApril, this.textMay, this.textJune, this.textJuly, this.textAugust, this.textSeptember, this.textOctober, this.textNovember, this.textDecember];
            this.dayNamesShort = [this.textShortSunday, this.textShortMonday, this.textShortTuesday, this.textShortWednesday, this.textShortThursday, this.textShortFriday, this.textShortSaturday];
            this.monthShortNames = [this.textShortJanuary, this.textShortFebruary, this.textShortMarch, this.textShortApril, this.textShortMay, this.textShortJune, this.textShortJuly, this.textShortAugust, this.textShortSeptember, this.textShortOctober, this.textShortNovember, this.textShortDecember];

            me.options.date = options.date;
            if (!_.isUndefined(options.firstday) && (options.firstday === 0 || options.firstday === 1)) {
                me.options.firstday = options.firstday;
            }

            me.enableKeyEvents= me.options.enableKeyEvents;

            me._state = undefined; // 0 - month, 1 - months, 2 - years

            me.render();
        },

        render: function () {
            var me = this;
            me.cmpEl = me.$el || $(this.el);
            me.cmpEl.html(this.template());

            me.currentDate = me.options.date || new Date();

            me.btnPrev = new Common.UI.Button({
                parentEl: me.cmpEl.find('#prev-arrow'),
                cls: '',
                iconCls: 'arrow-prev img-commonctrl'
            });
            me.btnPrev.on('click', _.bind(me.onClickPrev, me));

            me.btnNext = new Common.UI.Button({
                parentEl: me.cmpEl.find('#next-arrow'),
                cls: '',
                iconCls: 'arrow-next img-commonctrl'
            });
            me.btnNext.on('click', _.bind(me.onClickNext, me));

            me.cmpEl.on('keydown', function(e) {
                me.trigger('calendar:keydown', me, e);
            });

            me.renderMonth(me.currentDate);

            this.trigger('render:after', this);
            return this;
        },

        onClickPrev: function () {
            var me = this;
            if (me._state === 0) {
                var d = new Date(me.currentDate);
                d.setMonth(d.getMonth() - 1);
                if (d.getFullYear() > 0) {
                    me.renderMonth(d);
                }
            } else if (me._state === 1) {
                var d = new Date(me.currentDate);
                d.setFullYear(d.getFullYear() - 1);
                if (d.getFullYear() > 0) {
                    me.renderMonths(d);
                }
            } else if (me._state === 2) {
                var year = me.currentDate.getFullYear(),
                    newYear;
                if (year % 10 !== 0) {
                    newYear = String(year);
                    newYear = Number(newYear.slice(0, -1) + '0') - 1;
                } else {
                    newYear = year - 1;
                }
                if (newYear > 0) {
                    me.currentDate.setFullYear(newYear);
                    me.renderYears(newYear);
                }
            }
        },

        onClickNext: function () {
            var me = this;
            if (me._state === 0) {
                var d = new Date(me.currentDate);
                d.setMonth(d.getMonth() + 1);
                if (d.getFullYear() > 0) {
                    me.renderMonth(d);
                }
            } else if (me._state === 1) {
                var d = new Date(me.currentDate);
                d.setFullYear(d.getFullYear() + 1);
                if (d.getFullYear() > 0) {
                    me.renderMonths(d);
                }
            } else if (me._state === 2) {
                var year = me.currentDate.getFullYear(),
                    newYear;
                if (year % 10 !== 9) {
                    newYear = String(year);
                    newYear = Number(newYear.slice(0, -1) + '9') + 1;
                } else {
                    newYear = year + 1;
                }
                if (newYear > 0) {
                    me.currentDate.setFullYear(newYear);
                    me.renderYears(newYear);
                }
            }
        },

        renderYears: function (year) {
            var me = this,
                year = _.isNumber(year) ? year : (me.currentDate ? me.currentDate.getFullYear() : new Date().getFullYear());

            me._state = 2;
            me.$el.removeClass('view-days view-months').addClass('view-years');

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
                    disabled: (tmpYear > 0) ? false : true,
                    selected: (_.isDate(me.selectedDate)) ?
                        (tmpYear === me.selectedDate.getFullYear()) :
                        (tmpYear === new Date().getFullYear())
                });
                tmpYear++;
            }

            if (!me.yearPicker) {
                me.yearPicker = new Common.UI.DataView({
                    el: me.cmpEl.find('.calendar-content'),
                    store: new Common.UI.DataViewStore(arrYears),
                    itemTemplate: _.template('<div class="name-year <% if (!isCurrentDecade) { %> no-current-decade <% } %>" data-year="<%= year %>"><%= year %></div>')
                });
                me.yearPicker.on('item:click', function (picker, item, record, e) {
                    var year = record.get('year'),
                        date = new Date();
                    date.setFullYear(year);
                    me.renderMonths(date);
                });
                me.enableKeyEvents && this.yearPicker.on('item:keydown', function(view, record, e) {
                    if (e.keyCode==Common.UI.Keys.ESC) {
                        Common.NotificationCenter.trigger('dataview:blur');
                    }
                });
            } else
                me.yearPicker.store.reset(arrYears);

            me.enableKeyEvents && _.delay(function() {
                me.monthPicker.focus();
            }, 10);
        },

        renderMonths: function (date) {
            var me = this,
                curDate = (_.isDate(date)) ? date : (me.currentDate ? me.currentDate : new Date()),
                year = curDate.getFullYear();

            me._state = 1;
            me.currentDate = curDate;
            me.$el.removeClass('view-years view-days').addClass('view-months');

            // Number of year
            me.topTitle = _.template([
                '<div class="button"><label>' + year + '</label></div>'
            ].join(''));
            me.cmpEl.find('.calendar-header .title').html(me.topTitle);
            me.cmpEl.find('.calendar-header .title').off();
            me.cmpEl.find('.calendar-header .title').on('click', _.bind(me.renderYears, me));

            me.bottomTitle = _.template([
                '<label>' + me.textMonths + '</label>'
            ].join(''));
            me.cmpEl.find('.calendar-header .bottom-row').html(me.bottomTitle);

            var arrMonths = [];
            var today = new Date();

            for (var ind = 0; ind < 12; ind++) {
                arrMonths.push({
                    indexMonth: ind,
                    nameMonth: me.monthShortNames[ind],
                    year: year,
                    curYear: true,
                    isCurrentMonth: (ind === curDate.getMonth()),
                    selected: (_.isDate(me.selectedDate)) ?
                        (ind === me.selectedDate.getMonth() && year === me.selectedDate.getFullYear()) :
                        (ind === today.getMonth() && year === today.getFullYear())
                });
            }
            year = year + 1;
            for (var ind = 0; ind < 4; ind++) {
                arrMonths.push({
                    indexMonth: ind,
                    nameMonth: me.monthShortNames[ind],
                    year: year,
                    curYear: false,
                    selected: (_.isDate(me.selectedDate)) ?
                        (ind === me.selectedDate.getMonth() && year === me.selectedDate.getFullYear()) :
                        (ind === today.getMonth() && year === today.getFullYear())
                });
            }

            if (!me.monthsPicker) {
                me.monthsPicker = new Common.UI.DataView({
                    el: me.cmpEl.find('.calendar-content'),
                    store: new Common.UI.DataViewStore(arrMonths),
                    itemTemplate: _.template('<div class="name-month <% if (!curYear) { %> no-cur-year <% } %>" data-month="<%= indexMonth %>" data-year="<%= year %>"><%= nameMonth %></div>')
                });
                me.monthsPicker.on('item:click', function (picker, item, record, e) {
                    var month = record.get('indexMonth'),
                        year = record.get('year'),
                        date = new Date();
                    date.setFullYear(year, month);
                    me.renderMonth(date);
                });
                me.enableKeyEvents && this.monthsPicker.on('item:keydown', function(view, record, e) {
                    if (e.keyCode==Common.UI.Keys.ESC) {
                        Common.NotificationCenter.trigger('dataview:blur');
                    }
                });
            } else
                me.monthsPicker.store.reset(arrMonths);

            me.enableKeyEvents && _.delay(function() {
                me.monthPicker.focus();
            }, 10);
        },

        renderMonth: function (date) {
            var me = this;
            me._state = 0;
            var firstDay = me.options.firstday;

            // Current date
            var curDate = date || new Date(),
                curMonth = curDate.getMonth(),
                curIndexDayInWeek = curDate.getDay(),
                curNumberDayInMonth = curDate.getDate(),
                curYear = curDate.getFullYear();

            me.currentDate = curDate;
            me.$el.removeClass('view-years view-months').addClass('view-days');

            // Name month
            me.topTitle = _.template([
                '<div class="button">',
                '<label>' + me.monthNames[curMonth] + ' ' + curYear + '</label>',
                '</div>'
            ].join(''));
            me.cmpEl.find('.calendar-header .title').html(me.topTitle);
            me.cmpEl.find('.calendar-header .title').off();
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

            var tmp = new Date();
            tmp.setFullYear(year, month, numberDay);
            var today = new Date();

            for(var r = 0; r < rows; r++) {
                for(var c = 0; c < cols; c++) {
                    var tmpDay = tmp.getDay(),
                        tmpNumber = tmp.getDate(),
                        tmpMonth = tmp.getMonth(),
                        tmpYear = tmp.getFullYear();
                    arrDays.push({
                        indexInWeek: tmpDay,
                        dayNumber: tmpNumber,
                        month: tmpMonth,
                        year: tmpYear,
                        isCurrentMonth: tmpMonth === curMonth,
                        selected: (_.isDate(me.selectedDate)) ?
                            (tmpNumber === me.selectedDate.getDate() && tmpMonth === me.selectedDate.getMonth() && tmpYear === me.selectedDate.getFullYear()) :
                            (tmpNumber === today.getDate() && tmpMonth === today.getMonth() && tmpYear === today.getFullYear())
                    });
                    tmp.setDate(tmpNumber + 1);
                }
            }

            if (!me.monthPicker) {
                me.monthPicker = new Common.UI.DataView({
                    el: me.cmpEl.find('.calendar-content'),
                    store: new Common.UI.DataViewStore(arrDays),
                    itemTemplate: _.template('<div class="number-day<% if (indexInWeek === 6 || indexInWeek === 0) { %> weekend<% } %><% if (!isCurrentMonth) { %> no-current-month<% } %>" data-number="<%= dayNumber %>" data-month="<%= month %>" data-year="<%= year %>"><%= dayNumber %></div>')
                });
                me.monthPicker.on('item:click', function(picker, item, record, e) {
                    var day = record.get('dayNumber'),
                        month = record.get('month'),
                        year = record.get('year');
                    if (_.isUndefined(me.selectedDate)) {
                        me.selectedDate = new Date();
                    }
                    me.selectedDate.setFullYear(year, month, day);
                    me.trigger('date:click', me, me.selectedDate);
                });
                me.enableKeyEvents && this.monthPicker.on('item:keydown', function(view, record, e) {
                    if (e.keyCode==Common.UI.Keys.ESC) {
                        Common.NotificationCenter.trigger('dataview:blur');
                    }
                });
            } else
                me.monthPicker.store.reset(arrDays);

            me.enableKeyEvents && _.delay(function() {
                me.monthPicker.focus();
            }, 10);
        },

        daysInMonth: function (date) {
            var d;
            d = date ? new Date(date) : new Date();
            var result = new Date();
            result.setFullYear(d.getFullYear(), d.getMonth() + 1, 0);
            return result.getDate();
        },

        setDate: function (date) {
            if (_.isDate(date)) {
                this.selectedDate = new Date(date);
                this.renderMonth(this.selectedDate);
            }
        },

        focus: function () {
            var me = this;
            me.enableKeyEvents && me.monthPicker && _.delay(function() {
                me.monthPicker.focus();
            }, 10);
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
    }, Common.UI.Calendar || {}));
});