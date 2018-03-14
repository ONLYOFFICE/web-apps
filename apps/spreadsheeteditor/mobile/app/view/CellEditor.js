/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *    CellEdit.js
 *
 *    Created by Maxim Kadushkin on 11/28/2016
 *    Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/CellEditor.template',
    'jquery',
    'underscore',
    'backbone'
], function (template, $, _, Backbone) {
    'use strict';

    SSE.Views.CellEditor = Backbone.View.extend({
        el: '.pages > .page',
        template: _.template(template),

        events: {
            'click button#ce-btn-expand': 'expandEditor',
            'click #ce-function': function (e) {
                this.fireEvent('function:click', this);
            }
        },

        touch: {},
        tplHintItem: _.template('<li><a><%= caption %></a></li>'),

        initialize: function (options) {
        },

        render: function () {
            var $el = $(this.el);
            this.$el = $(this.template()).prependTo($el);

            this.$cellname = $('#ce-cell-name', this.el);
            this.$btnexpand = $('#ce-btn-expand', this.el);
            this.$boxfuncs = $('.group-functions-list', this.el);
            this.$listfuncs = $('.func-list', this.$boxfuncs);

            // this.$btnfunc = $('#ce-function', this.el);

            this.$listfuncs.on({
                'touchstart': this.onTouchStart.bind(this),
                'touchmove': this.onTouchMove.bind(this),
                'touchend': this.onTouchEnd.bind(this)
            });

            return this;
        },

        updateCellInfo: function(info) {
            if (info) {
                this.$cellname.html(typeof(info)=='string' ? info : info.asc_getName());
            }
        },

        expandEditor: function() {
            if (this.$el.hasClass('expanded')) {
                this.$el.removeClass('expanded');
                this.$btnexpand.removeClass('collapse');
            } else {
                this.$el.addClass('expanded');
                this.$btnexpand.addClass('collapse');
            }

            // Common.NotificationCenter.trigger('layout:changed', 'celleditor');
            // Common.NotificationCenter.trigger('edit:complete', this.editor, {restorefocus:true});
        },

        clearFunctionsHint: function () {
            this.$listfuncs.find('li').off('click');
            this.$listfuncs.empty();
            this.$listfuncs.scrollLeft(0);
        },

        cellNameDisabled: function(disabled){
            // (disabled) ? this.$cellname.attr('disabled', 'disabled') : this.$cellname.removeAttr('disabled');
            // this.$btnfunc.toggleClass('disabled', disabled);
            // this.btnNamedRanges.setDisabled(disabled);
        },

        resetFunctionsHint: function(funcarr) {
            this.clearFunctionsHint();

            var me = this;
            var onhintclick = function(name, type, e) {
                this.fireEvent('function:hint', [name, type]);
            };

            var items = [];
            _.each(funcarr, function(func, index) {
                var $item = $(me.tplHintItem({
                    caption: func.asc_getName()
                }));

                $item.on('click', onhintclick.bind(me, func.asc_getName(), func.asc_getType()));
                items.push($item);
            });

            this.$listfuncs.append(items);
        },

        hasHiddenFunctionsHint: function() {
            var _left_bound_ = this.$boxfuncs.offset().left,
                _right_bound_ = _left_bound_ + this.$boxfuncs.width();

            var $items = this.$listfuncs.find('li');
            var rect = $items.first().get(0).getBoundingClientRect();

            if ( !(rect.left < _left_bound_) ) {
                rect = $items.last().get(0).getBoundingClientRect();

                if ( !(rect.right > _right_bound_) )
                    return false;
            }

            return true;
        },

        onTouchStart: function(e) {
            if ( this.hasHiddenFunctionsHint() ) {
                var touches = e.originalEvent.changedTouches;
                this.touch.startx = touches[0].clientX;
                this.touch.scrollx = this.$listfuncs.scrollLeft();

                this.touch.timer = setTimeout(function () {
                    // touch.longtouch = true;
                }, 500);
                e.preventDefault();
            }
        },

        onTouchMove: function(e) {
            if ( this.touch.startx !== undefined ) {
                var touches = e.originalEvent.changedTouches;

                if ( this.touch.longtouch ) {}
                else {
                    if ( this.touch.timer ) clearTimeout(this.touch.timer), delete this.touch.timer;
                    this.$listfuncs.scrollLeft(this.touch.scrollx + (this.touch.startx - touches[0].clientX));
                }

                e.preventDefault();
            }
        },

        onTouchEnd: function(e) {
            if ( this.touch.startx !== undefined ) {
                this.touch.longtouch = false;
                delete this.touch.startx;
                e.preventDefault();
            }
        }

    });
});
