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
 *  Calendar.js
 *
 *  Created by Julia Svinareva on 18/10/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */


if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/component/Window',
    'underscore'
], function (base, _) {
    'use strict';

    Common.Views.Calendar = Common.UI.Window.extend(_.extend({

        // Window

        initialize: function (options) {
            var _options = {};

            _.extend(_options, {
                closable: false,
                width: 192,
                height: 214,
                header: false,
                modal: false,
                alias: 'Common.Views.Calendar',
                firstNumber: 0, // 0 or 6
                cls: 'calendar-window'
            }, options);

            this.template = options.template || [
                '<div class="box">',
                '<div id="id-popover" class="calendar-popover" style="overflow-y: hidden;position: relative;">',
                '<div id="id-calendar-popover">',
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
                '</div>',
                '</div>',
                '</div>'
            ].join('');

            this.monthNames = [this.textJanuary, this.textFebruary, this.textMarch, this.textApril, this.textMay, this.textJune, this.textJuly, this.textAugust, this.textSeptember, this.textOctober, this.textNovember, this.textDecember];
            this.dayNamesShort = [this.textShortSunday, this.textShortMonday, this.textShortTuesday, this.textShortWednesday, this.textShortThursday, this.textShortFriday, this.textShortSaturday];



            _options.tpl = _.template(this.template)(_options);

            Common.UI.Window.prototype.initialize.call(this, _options);

            return this;
        },
        render: function () {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                window = this.$window;

            window.css({
                height: '',
                minHeight: '',
                overflow: 'hidden',
                position: 'absolute',
                zIndex: '990'
            });

            var body = window.find('.body');
            if (body) {
                body.css('position', 'relative');
            }

            me.btnPrev = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'mmerge-prev',
            });
            me.btnPrev.render(me.$window.find('#prev-arrow'));

            me.btnNext = new Common.UI.Button({
                cls: 'btn-toolbar',
                iconCls: 'mmerge-next',
            });
            me.btnNext.render(me.$window.find('#next-arrow'));

            me.topTitle = _.template([
                '<label>' + me.monthNames[0] + '</label>',
                '<label>' + 2019 + '</label>'
            ].join(''));
            me.$window.find('.calendar-header .title').html(me.topTitle);

            var dayNamesTemplate = '';
            me.dayNamesShort.forEach(function (item) {
                dayNamesTemplate += '<label>' + item + '</label>';
            });
            me.$window.find('.calendar-header .bottom-row').html(_.template(dayNamesTemplate));

        },

        getCalendarPopover: function (options) {
            if (!this.popover)
                this.popover = new Common.Views.Calendar(options);
            return this.popover;
        },

        showCalendarPopover: function (animate, loadText, focus, showText) {
            this.options.animate = animate;

            Common.UI.Window.prototype.show.call(this);
            if (this.scroller) {
                this.scroller.update({minScrollbarLength: 40, alwaysVisibleY: true});
            }
        },

        setLeftTop: function (posX, posY) {
            if (!this.$window)
                this.render();

            if (_.isUndefined(posX) && _.isUndefined(posY))
                return;

            var calendarView = $('#id-popover'),
                editorView = $('#editor_sdk'),
                editorBounds = null,
                sdkBoundsHeight = 0,
                sdkBoundsTop = 0,
                sdkBoundsLeft = 0,
                sdkPanelRight = '',
                sdkPanelRightWidth = 0,
                sdkPanelLeft = '',
                sdkPanelLeftWidth = 0,
                sdkPanelThumbs = '', // for PE
                sdkPanelThumbsWidth = 0, // for PE
                sdkPanelTop = '',
                sdkPanelHeight = 0,
                leftPos = 0,
                windowWidth = 0,
                outerHeight = 0,
                topPos = 0,
                sdkBoundsTopPos = 0;

            if (calendarView && editorView && editorView.get(0)) {
                editorBounds = editorView.get(0).getBoundingClientRect();
                if (editorBounds) {
                    //sdkBoundsHeight = editorBounds.height - this.sdkBounds.padding * 2;

                    this.$window.css({maxHeight: sdkBoundsHeight + 'px'});

                    //this.sdkBounds.width = editorBounds.width;
                    //this.sdkBounds.height = editorBounds.height;

                    // LEFT CORNER

                    if (!_.isUndefined(posX)) {

                        sdkPanelRight = $('#id_vertical_scroll');
                        if (sdkPanelRight.length) {
                            sdkPanelRightWidth = (sdkPanelRight.css('display') !== 'none') ? sdkPanelRight.width() : 0;
                        } else {
                            sdkPanelRight = $('#ws-v-scrollbar');
                            if (sdkPanelRight.length) {
                                sdkPanelRightWidth = (sdkPanelRight.css('display') !== 'none') ? sdkPanelRight.width() : 0;
                            }
                        }

                        //this.sdkBounds.width -= sdkPanelRightWidth;

                        sdkPanelLeft = $('#id_panel_left');
                        if (sdkPanelLeft.length) {
                            sdkPanelLeftWidth = (sdkPanelLeft.css('display') !== 'none') ? sdkPanelLeft.width() : 0;
                        }
                        sdkPanelThumbs = $('#id_panel_thumbnails');
                        if (sdkPanelThumbs.length) {
                            sdkPanelThumbsWidth = (sdkPanelThumbs.css('display') !== 'none') ? sdkPanelThumbs.width() : 0;
                            //this.sdkBounds.width -= sdkPanelThumbsWidth;
                        }

                        //leftPos = Math.min(sdkBoundsLeft + posX + this.arrow.width, sdkBoundsLeft + this.sdkBounds.width - this.$window.outerWidth() - 25);
                        leftPos = posX;
                        //leftPos = Math.max(sdkBoundsLeft + sdkPanelLeftWidth + this.arrow.width, leftPos);

                        /*if (!_.isUndefined(leftX)) {
                            windowWidth = this.$window.outerWidth();
                            if (windowWidth) {
                                if ((posX + windowWidth > this.sdkBounds.width - this.arrow.width + 5) && (this.leftX > windowWidth)) {
                                    leftPos = this.leftX - windowWidth + sdkBoundsLeft - this.arrow.width;
                                    arrowView.removeClass('left').addClass('right');
                                } else {
                                    leftPos = sdkBoundsLeft + posX + this.arrow.width;
                                }
                            }
                        }*/

                        this.$window.css('left', leftPos + 'px');
                    }

                    // TOP CORNER

                    if (!_.isUndefined(posY)) {
                        /*sdkPanelTop = $('#id_panel_top');
                        sdkBoundsTopPos = sdkBoundsTop;
                        if (sdkPanelTop.length) {
                            sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                            sdkBoundsTopPos += this.sdkBounds.paddingTop;
                        } else {
                            sdkPanelTop = $('#ws-h-scrollbar');
                            if (sdkPanelTop.length) {
                                sdkPanelHeight = (sdkPanelTop.css('display') !== 'none') ? sdkPanelTop.height() : 0;
                            }
                        }*/

                        //this.sdkBounds.height -= sdkPanelHeight;

                        outerHeight = this.$window.outerHeight();

                        //topPos = Math.min(sdkBoundsTop + sdkBoundsHeight - outerHeight, this.arrowPosY + sdkBoundsTop - this.arrow.height);
                        topPos = posY;
                        //topPos = Math.max(topPos, sdkBoundsTopPos);

                        this.$window.css('top', topPos + 'px');
                    }
                }
            }
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
        textShortSunday: 'Su',
        textShortMonday: 'Mo',
        textShortTuesday: 'Tu',
        textShortWednesday: 'We',
        textShortThursday: 'Th',
        textShortFriday: 'Fr',
        textShortSaturday: 'Sa'

    }, Common.Views.Calendar || {}))
});